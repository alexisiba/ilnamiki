import { randomUUID } from 'crypto'
import { stat } from 'fs/promises'
import { join } from 'path'

import type {
  AddFolderResult,
  FolderScan,
  GameFolder,
  ScanFolderRequest,
  ScanFolderResult
} from '@shared/api'

import { getDatabase, transaction } from '../../core/database'
import { listInstalledPlatforms } from '../../core/installedPlatforms'
import { selectForPlatform } from '../../core/platform'
import { gameExtensionsOf } from './library.catalog'
import { createLibraryRepository, type FolderWithGameCount } from './library.repository'
import { findGames } from './library.scan'
import { linuxFolderReader } from './providers/linux'
import { unsupportedFolderReader } from './providers/unsupported'

const reader = selectForPlatform({ linux: linuxFolderReader }, unsupportedFolderReader)

/** Stops the scan running, if any. */
let runningScan: AbortController | null = null

/** The latest scan that finished, until its folder is added or another scan starts. */
let latestScan: FolderScan | null = null

/** Whether a folder is still at `path`. */
async function isFolder(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory()
  } catch {
    return false
  }
}

async function toGameFolder(folder: FolderWithGameCount): Promise<GameFolder> {
  return {
    id: folder.id,
    path: folder.path,
    platformId: folder.platformId,
    gameCount: folder.gameCount,
    isAvailable: await isFolder(folder.path),
    addedAt: folder.createdAt
  }
}

/** The user's folders of games: read by the operating system's provider, kept in the database. */
export const libraryService = {
  /**
   * Finds the games in a folder with the extensions of its platform's installed cores,
   * calling `onProgress` with the fraction done. Starting a scan cancels the one running.
   */
  async scanFolder(
    { path, platformId }: ScanFolderRequest,
    onProgress: (fraction: number) => void
  ): Promise<ScanFolderResult> {
    runningScan?.abort()
    latestScan = null
    const controller = new AbortController()
    runningScan = controller

    try {
      const repository = createLibraryRepository(getDatabase())
      if (repository.findFolderByPath(path)) return { ok: false, problem: 'already-added' }
      if (repository.findFolderByPlatform(platformId)) {
        return { ok: false, problem: 'platform-has-folder' }
      }

      const platform = (await listInstalledPlatforms()).find(({ id }) => id === platformId)
      if (!platform) return { ok: false, problem: 'unknown-platform' }

      // Other platforms' folders inside this one hold their own games.
      const otherFolders = repository.listFolders().map((folder) => folder.path)
      const result = await reader.read(path, {
        excludedFolders: otherFolders,
        signal: controller.signal,
        onProgress
      })
      if (!result.ok) return result

      const coreExtensions = platform.cores.flatMap((core) => core.extensions)
      const games = findGames({
        files: result.files,
        indexTexts: result.indexTexts,
        extensions: gameExtensionsOf(platformId, coreExtensions)
      })

      const scan: FolderScan = {
        id: randomUUID(),
        path,
        platformId,
        games: games.map(({ title, path: relativePath, problem }) => ({
          title,
          relativePath,
          problem
        }))
      }
      latestScan = scan
      return { ok: true, scan }
    } catch (error) {
      if (controller.signal.aborted) return { ok: false, problem: 'cancelled' }
      throw error
    } finally {
      if (runningScan === controller) runningScan = null
    }
  },

  /** Cancels the scan running, if any. */
  cancelScan(): void {
    runningScan?.abort()
  },

  /**
   * Adds the folder of the latest scan with its playable games, all in one transaction, or
   * says why it can't. The folder isn't scanned again: what the user saw is what is kept.
   */
  async addFolder(scanId: string): Promise<AddFolderResult> {
    const scan = latestScan
    if (!scan || scan.id !== scanId) return { ok: false, problem: 'unknown-scan' }

    const db = getDatabase()
    const repository = createLibraryRepository(db)
    // Checked again: a folder may have been added since the scan.
    if (repository.findFolderByPath(scan.path)) return { ok: false, problem: 'already-added' }
    if (repository.findFolderByPlatform(scan.platformId)) {
      return { ok: false, problem: 'platform-has-folder' }
    }

    const playable = scan.games.filter((game) => game.problem === null)
    if (playable.length === 0) return { ok: false, problem: 'no-games' }

    const id = randomUUID()
    const now = Date.now()
    transaction(db, () => {
      repository.insertFolder({
        id,
        path: scan.path,
        platformId: scan.platformId,
        createdAt: now,
        updatedAt: now
      })
      repository.saveGames(
        id,
        scan.platformId,
        playable.map((game) => ({
          id: randomUUID(),
          filePath: join(scan.path, game.relativePath),
          title: game.title
        })),
        now
      )
    })
    latestScan = null

    const folder = repository.findFolderById(id)
    if (!folder) throw new Error('The folder just added is missing')
    return { ok: true, folder: await toGameFolder(folder) }
  },

  async listFolders(): Promise<GameFolder[]> {
    const folders = createLibraryRepository(getDatabase()).listFolders()
    return Promise.all(folders.map(toGameFolder))
  }
}
