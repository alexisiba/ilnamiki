import type { DescribedGame, GameToDescribe } from './gameMetadata.describe'
import type { ProviderSources } from './gameMetadata.providers'

/** Described games kept before they are written together, in one transaction. */
const BATCH_SIZE = 50

/** What the queue needs, passed in so it runs without Electron, a worker or a database file. */
export interface MetadataQueueDependencies {
  /** The games of the folders `folderIds` (every folder when null) to look at. */
  listGames(folderIds: string[] | null): GameToDescribe[]
  /** What the providers will look in, read live before each run. */
  findSources(): Promise<ProviderSources>
  /**
   * Describes `games` off main's thread, calling `onDescribed` for each one as soon as it is
   * described; resolves when all are done or `signal` stops it.
   */
  describe(
    games: GameToDescribe[],
    sources: ProviderSources,
    onDescribed: (game: DescribedGame) => void,
    signal: AbortSignal
  ): Promise<void>
  /** Writes `games` together, as looked at `now`. */
  save(games: DescribedGame[], now: number): void
  now(): number
}

export interface MetadataQueue {
  /**
   * Asks for the games of the folder `folderId`, or of every folder, to be described. Starts
   * now unless a run is going, then right after it.
   */
  request(folderId?: string): void
  /** Stops the run going, if any, and every run asked for. */
  stop(): void
  /** Resolves once no run is going nor waiting. */
  whenIdle(): Promise<void>
}

/** What is waiting to be described: every folder, or some of them. */
type Waiting = 'all' | Set<string>

/**
 * One queue of runs over the library, one at a time: each lists the games to look at, has
 * them described and writes them in batches, so main only does short writes.
 */
export function createMetadataQueue(dependencies: MetadataQueueDependencies): MetadataQueue {
  let waiting: Waiting | null = null
  let running: Promise<void> | null = null
  let controller: AbortController | null = null

  async function runOnce(folders: Waiting, signal: AbortSignal): Promise<void> {
    const games = dependencies.listGames(folders === 'all' ? null : [...folders])
    if (games.length === 0) return
    const sources = await dependencies.findSources()

    let batch: DescribedGame[] = []
    const flush = (): void => {
      if (batch.length === 0) return
      dependencies.save(batch, dependencies.now())
      batch = []
    }
    try {
      await dependencies.describe(
        games,
        sources,
        (game) => {
          batch.push(game)
          if (batch.length >= BATCH_SIZE) flush()
        },
        signal
      )
    } finally {
      // What was described before a stop is kept: it isn't described again.
      flush()
    }
  }

  async function drain(): Promise<void> {
    while (waiting) {
      const folders = waiting
      waiting = null
      controller = new AbortController()
      try {
        await runOnce(folders, controller.signal)
      } catch (error) {
        console.error('Describing games failed', error)
      }
    }
    controller = null
  }

  function start(): void {
    running ??= drain().finally(() => {
      running = null
      // Asked for while the last run was ending.
      if (waiting) start()
    })
  }

  return {
    request(folderId) {
      if (folderId === undefined || waiting === 'all') {
        waiting = 'all'
      } else {
        waiting ??= new Set()
        waiting.add(folderId)
      }
      start()
    },

    stop() {
      waiting = null
      controller?.abort()
    },

    async whenIdle() {
      while (running) await running
    }
  }
}
