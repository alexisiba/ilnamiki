import { stat } from 'fs/promises'
import { parentPort, workerData } from 'worker_threads'

import { createArtworkDownloader } from './artwork'
import { artworkIdentityOf, describeGame, type FileState } from './gameMetadata.describe'
import { findArtwork } from './gameMetadata.fallback'
import { createMetadataProviders } from './gameMetadata.providers'
import { MetadataUnavailableError } from './gameMetadata.types'
import type { MetadataWorkerInput, MetadataWorkerMessage } from './gameMetadata.worker.types'

/**
 * The metadata worker: describes the games it is given, off main's thread, since reading
 * whole databases, working out checksums of large files and downloading artwork would hold
 * main up. It posts what it finds about each game as soon as it does, and ends when all are
 * done.
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

const post = (message: MetadataWorkerMessage): void => parentPort?.postMessage(message)

/**
 * Logs why a game couldn't be described; it is tried again on a later run. A provider with
 * nothing to look in yet (no database, no network) is expected, not worth a line per game.
 */
function report(error: unknown, what: string, filePath: string): void {
  if (!(error instanceof MetadataUnavailableError)) {
    console.error(`Couldn't find the ${what} of ${filePath}`, error)
  }
}

async function run({
  games,
  sources,
  artworkFolder,
  userAgent
}: MetadataWorkerInput): Promise<void> {
  const providers = createMetadataProviders(sources)
  const download = createArtworkDownloader({ folder: artworkFolder, userAgent })
  // Once artwork couldn't be asked (no network, the server down), the rest of this run doesn't
  // try either: each game would only wait for the same failure.
  let isArtworkUnavailable = false

  for (const game of games) {
    let described: Awaited<ReturnType<typeof describeGame>>
    try {
      described = await describeGame(game, providers, fileStateOf)
      if (described) post({ type: 'details', game: described })
    } catch (error) {
      report(error, 'details', game.filePath)
      continue
    }

    // Artwork needs the network; without it the details above are kept all the same.
    const identity = artworkIdentityOf(game, described)
    if (!identity || isArtworkUnavailable) continue
    try {
      const artwork = await findArtwork(providers.artwork, identity, (kind, url) =>
        download(game.id, kind, url)
      )
      post({ type: 'artwork', gameId: game.id, artwork })
    } catch (error) {
      if (error instanceof MetadataUnavailableError) isArtworkUnavailable = true
      report(error, 'artwork', game.filePath)
    }
  }
}

run(workerData as MetadataWorkerInput).catch((error) => {
  console.error('The metadata worker stopped', error)
})
