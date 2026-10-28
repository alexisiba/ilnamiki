import { stat } from 'fs/promises'
import { parentPort, workerData } from 'worker_threads'

import { describeGame, type FileState } from './gameMetadata.describe'
import { createMetadataProviders } from './gameMetadata.providers'
import { MetadataUnavailableError } from './gameMetadata.types'
import type { MetadataWorkerInput, MetadataWorkerMessage } from './gameMetadata.worker.types'

/**
 * The metadata worker: describes the games it is given, off main's thread, since reading
 * whole databases and working out checksums of large files would hold main up. It posts each
 * game as soon as it is described and ends when all are done.
 */

/** The size and modification time of the file at `path`; null when it is gone. */
async function fileStateOf(path: string): Promise<FileState | null> {
  try {
    const { size, mtimeMs } = await stat(path)
    return { size, modifiedAt: Math.trunc(mtimeMs) }
  } catch {
    return null
  }
}

async function run({ games, sources }: MetadataWorkerInput): Promise<void> {
  const providers = createMetadataProviders(sources)
  for (const game of games) {
    try {
      const described = await describeGame(game, providers, fileStateOf)
      if (described) parentPort?.postMessage(described satisfies MetadataWorkerMessage)
    } catch (error) {
      // Not taken as asked: it is tried again on a later run. A provider with nothing to look
      // in yet (a platform without databases) is expected, not worth a log line per game.
      if (!(error instanceof MetadataUnavailableError)) {
        console.error(`Couldn't describe the game ${game.filePath}`, error)
      }
    }
  }
}

run(workerData as MetadataWorkerInput).catch((error) => {
  console.error('The metadata worker stopped', error)
})
