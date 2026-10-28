import { app } from 'electron'
import { join } from 'path'

import { getDatabase, transaction } from '../database'
import { createEmulatorsRepository, findModule, installationOf } from '../emulators'
import type { GameToDescribe, MetadataUpdate } from './gameMetadata.describe'
import type { ProviderSources } from './gameMetadata.providers'
import { createGameMetadataRepository } from './gameMetadata.repository'
import type { MetadataWorkerInput, MetadataWorkerMessage } from './gameMetadata.worker.types'
import { createMetadataQueue } from './gameMetadataQueue'

/** Where games' artwork is kept: one folder per game, in the app's data folder. */
export const artworkFolder = (): string => join(app.getPath('userData'), 'artwork')

/** What the providers look in: the libretro databases every emulator of the user keeps. */
async function findSources(): Promise<ProviderSources> {
  const emulators = createEmulatorsRepository(getDatabase()).list()
  const databases = await Promise.all(
    emulators.map(async ({ kind, executablePath }) => {
      const module = findModule(kind)
      if (!module?.listGameDatabases) return []
      return module.listGameDatabases(installationOf(executablePath))
    })
  )
  return {
    libretroDatabases: databases
      .flat()
      .filter(({ format }) => format === 'libretro-rdb')
      .map(({ platformId, name, path }) => ({ platformId, name, path }))
  }
}

/** Describes `games` in the metadata worker, made for this run and gone when it ends. */
async function describeInWorker(
  games: GameToDescribe[],
  sources: ProviderSources,
  onUpdate: (update: MetadataUpdate) => void,
  signal: AbortSignal
): Promise<void> {
  // Loaded here, not at the top: only Electron's build knows how to start a worker module.
  const { default: createWorker } = await import('./gameMetadata.worker?nodeWorker')
  if (signal.aborted) return
  const input: MetadataWorkerInput = {
    games,
    sources,
    artworkFolder: artworkFolder(),
    userAgent: `Ilnamiki/${app.getVersion()}`
  }
  const worker = createWorker({ workerData: input })
  const stop = (): void => void worker.terminate()
  signal.addEventListener('abort', stop)
  try {
    await new Promise<void>((resolve, reject) => {
      worker.on('message', (update: MetadataWorkerMessage) => onUpdate(update))
      worker.on('error', reject)
      worker.on('exit', () => resolve())
    })
  } finally {
    signal.removeEventListener('abort', stop)
  }
}

/** Who is told which games' metadata was just written. */
const describedListeners = new Set<(gameIds: string[]) => void>()

/**
 * Calls `listener` with the games whose metadata was just written, each time a batch is
 * written while games are being described; never while nothing is. Returns the unsubscribe
 * function.
 */
export function onGamesDescribed(listener: (gameIds: string[]) => void): () => void {
  describedListeners.add(listener)
  return () => {
    describedListeners.delete(listener)
  }
}

const queue = createMetadataQueue({
  listGames: (folderIds) =>
    createGameMetadataRepository(getDatabase()).listGamesToDescribe(folderIds),
  findSources,
  describe: describeInWorker,
  save(updates, now) {
    const db = getDatabase()
    transaction(db, () => createGameMetadataRepository(db).save(updates, now))
    const gameIds = [
      ...new Set(
        updates.map((update) => (update.type === 'details' ? update.game.gameId : update.gameId))
      )
    ]
    for (const listener of [...describedListeners]) listener(gameIds)
  },
  now: Date.now
})

/** Describes, in the background, the library's games not described yet or whose file changed. */
export function describeLibrary(): void {
  queue.request()
}

/** Describes, in the background, the games of the folder `folderId` that need it. */
export function describeFolder(folderId: string): void {
  queue.request(folderId)
}

/** Stops describing games, e.g. as the app quits. */
export function stopDescribingGames(): void {
  queue.stop()
}
