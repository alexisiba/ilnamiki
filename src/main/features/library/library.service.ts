import { randomUUID } from 'crypto'

import type { ScanFolderRequest, ScanFolderResult } from '@shared/api'

import { listInstalledPlatforms } from '../../core/installedPlatforms'
import { selectForPlatform } from '../../core/platform'
import { gameExtensionsOf } from './library.catalog'
import { findGames } from './library.scan'
import { linuxFolderReader } from './providers/linux'
import { unsupportedFolderReader } from './providers/unsupported'

const reader = selectForPlatform({ linux: linuxFolderReader }, unsupportedFolderReader)

/** Stops the scan running, if any. */
let runningScan: AbortController | null = null

/** The user's folders of games, read by the operating system's provider. */
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
    const controller = new AbortController()
    runningScan = controller

    try {
      const platform = (await listInstalledPlatforms()).find(({ id }) => id === platformId)
      if (!platform) return { ok: false, problem: 'unknown-platform' }

      const result = await reader.read(path, {
        excludedFolders: [],
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

      return {
        ok: true,
        scan: {
          id: randomUUID(),
          path,
          platformId,
          games: games.map(({ title, path: relativePath, problem }) => ({
            title,
            relativePath,
            problem
          }))
        }
      }
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
  }
}
