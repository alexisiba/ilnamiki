import { randomUUID } from 'crypto'
import { stat } from 'fs/promises'
import { join } from 'path'

import type {
  AddFolderResult,
  FolderGame,
  FolderScan,
  GameFolder,
  ScanFolderRequest,
  ScanFolderResult,
  UpdateFolderResult
} from '@shared/api'

import { getDatabase, transaction } from '../../core/database'
import { listInstalledPlatforms } from '../../core/installedPlatforms'
import { selectForPlatform } from '../../core/platform'
import { gameExtensionsOf } from './library.catalog'
import {
  createLibraryRepository,
  type FolderWithGameCount,
  type GameToSave
} from './library.repository'
import { findGames } from './library.scan'
import { linuxFolderReader } from './providers/linux'
import { unsupportedFolderReader } from './providers/unsupported'

const reader = selectForPlatform({ linux: linuxFolderReader }, unsupportedFolderReader)

/** Stops the scan running, if any. */
let runningScan: AbortController | null = null

/**
 * The latest scan that finished, until its folder is saved or another scan starts, with the
 * id of the folder it scanned again (null when it scanned a folder to add).
 */
let latestScan: { scan: FolderScan; folderId: string | null } | null = null

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

/** The playable games of `scan`, to save with new ids (a game stored before keeps its own). */
function playableGamesOf(scan: FolderScan): GameToSave[] {
  return scan.games
    .filter((game) => game.problem === null)
    .map((game) => ({
      id: randomUUID(),
      filePath: join(scan.path, game.relativePath),
      title: game.title
    }))
}

/**
 * Finds the games in the folder at `path` with the extensions of its platform's installed
 * cores, calling `onProgress` with the fraction done. Starting a scan cancels the one running.
 * The scan is kept as the latest, of the folder `folderId` when it scans one again.
 */
async function scan(
  { path, platformId }: ScanFolderRequest,
  folderId: string | null,
  onProgress: (fraction: number) => void,
  controller: AbortController
): Promise<ScanFolderResult> {
  const platform = (await listInstalledPlatforms()).find(({ id }) => id === platformId)
  if (!platform) return { ok: false, problem: 'unknown-platform' }

  // Other platforms' folders inside this one hold their own games.
  const otherFolders = createLibraryRepository(getDatabase())
    .listFolders()
    .map((folder) => folder.path)
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

  const folderScan: FolderScan = {
    id: randomUUID(),
    path,
    platformId,
    games: games.map(({ title, path: relativePath, problem }) => ({
      title,
      relativePath,
      problem
    }))
  }
  latestScan = { scan: folderScan, folderId }
  return { ok: true, scan: folderScan }
}

/**
 * Runs `run` as the only scan, cancelling the one running and forgetting the latest; it
 * resolves as `cancelled` when it is cancelled in turn.
 */
async function runScan(
  run: (controller: AbortController) => Promise<ScanFolderResult>
): Promise<ScanFolderResult> {
  runningScan?.abort()
  latestScan = null
  const controller = new AbortController()
  runningScan = controller

  try {
    return await run(controller)
  } catch (error) {
    if (controller.signal.aborted) return { ok: false, problem: 'cancelled' }
    throw error
  } finally {
    if (runningScan === controller) runningScan = null
  }
}

/** The user's folders of games: read by the operating system's provider, kept in the database. */
export const libraryService = {
  /**
   * Finds the games in a folder to add, or says why it can't, calling `onProgress` with the
   * fraction done. Starting a scan cancels the one running.
   */
  scanFolder(
    request: ScanFolderRequest,
    onProgress: (fraction: number) => void
  ): Promise<ScanFolderResult> {
    return runScan(async (controller) => {
      const repository = createLibraryRepository(getDatabase())
      if (repository.findFolderByPath(request.path)) return { ok: false, problem: 'already-added' }
      if (repository.findFolderByPlatform(request.platformId)) {
        return { ok: false, problem: 'platform-has-folder' }
      }
      return scan(request, null, onProgress, controller)
    })
  },

  /** Finds the games in a folder the user added, as `scanFolder` does, or says why it can't. */
  rescanFolder(
    folderId: string,
    onProgress: (fraction: number) => void
  ): Promise<ScanFolderResult> {
    return runScan(async (controller) => {
      const folder = createLibraryRepository(getDatabase()).findFolderById(folderId)
      if (!folder) return { ok: false, problem: 'unknown-folder' }
      return scan(folder, folderId, onProgress, controller)
    })
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
    if (!latestScan || latestScan.scan.id !== scanId || latestScan.folderId !== null) {
      return { ok: false, problem: 'unknown-scan' }
    }
    const { scan: folderScan } = latestScan

    const db = getDatabase()
    const repository = createLibraryRepository(db)
    // Checked again: a folder may have been added since the scan.
    if (repository.findFolderByPath(folderScan.path)) return { ok: false, problem: 'already-added' }
    if (repository.findFolderByPlatform(folderScan.platformId)) {
      return { ok: false, problem: 'platform-has-folder' }
    }

    const playable = playableGamesOf(folderScan)
    if (playable.length === 0) return { ok: false, problem: 'no-games' }

    const id = randomUUID()
    const now = Date.now()
    transaction(db, () => {
      repository.insertFolder({
        id,
        path: folderScan.path,
        platformId: folderScan.platformId,
        createdAt: now,
        updatedAt: now
      })
      repository.saveGames(id, folderScan.platformId, playable, now)
    })
    latestScan = null

    const folder = repository.findFolderById(id)
    if (!folder) throw new Error('The folder just added is missing')
    return { ok: true, folder: await toGameFolder(folder) }
  },

  /**
   * Updates the folder of the latest scan made again to its playable games, all in one
   * transaction, or says why it can't. As when adding, what the user saw is what is kept.
   */
  async updateFolder(scanId: string): Promise<UpdateFolderResult> {
    if (!latestScan || latestScan.scan.id !== scanId || latestScan.folderId === null) {
      return { ok: false, problem: 'unknown-scan' }
    }
    const { scan: folderScan, folderId } = latestScan

    const db = getDatabase()
    const repository = createLibraryRepository(db)
    // Checked again: the folder may have been removed since the scan.
    if (!repository.findFolderById(folderId)) return { ok: false, problem: 'unknown-folder' }

    const playable = playableGamesOf(folderScan)
    if (playable.length === 0) return { ok: false, problem: 'no-games' }

    const found = new Set(playable.map((game) => game.filePath))
    const gone = repository
      .listGames(folderId)
      .filter((game) => !found.has(game.filePath))
      .map((game) => game.id)
    const now = Date.now()
    transaction(db, () => {
      repository.removeGames(gone, now)
      repository.saveGames(folderId, folderScan.platformId, playable, now)
      repository.touchFolder(folderId, now)
    })
    latestScan = null

    const folder = repository.findFolderById(folderId)
    if (!folder) throw new Error('The folder just updated is missing')
    return { ok: true, folder: await toGameFolder(folder) }
  },

  async listFolders(): Promise<GameFolder[]> {
    const folders = createLibraryRepository(getDatabase()).listFolders()
    return Promise.all(folders.map(toGameFolder))
  },

  /** The games of the folder `folderId`, by title; none when there is no such folder. */
  listFolderGames(folderId: string): FolderGame[] {
    return createLibraryRepository(getDatabase()).listGames(folderId)
  }
}
