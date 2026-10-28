import { describe, expect, it, vi } from 'vitest'

import type { DescribedGame, GameToDescribe } from './gameMetadata.describe'
import { NO_DETAILS } from './gameMetadata.fallback'
import { createMetadataQueue, type MetadataQueueDependencies } from './gameMetadataQueue'

const game = (id: string): GameToDescribe => ({
  id,
  platformId: 'game_boy',
  filePath: `/roms/gb/${id}.gb`,
  lookedAtFile: null
})

const described = (id: string): DescribedGame => ({
  gameId: id,
  identity: null,
  details: NO_DETAILS,
  file: { size: 1, modifiedAt: 1 }
})

/** A queue over `games` per folder, whose worker describes every game it gets. */
function queueOver(
  gamesByFolder: Record<string, GameToDescribe[]>,
  overrides: Partial<MetadataQueueDependencies> = {}
): { queue: ReturnType<typeof createMetadataQueue>; dependencies: MetadataQueueDependencies } {
  const dependencies: MetadataQueueDependencies = {
    listGames: vi.fn((folderIds: string[] | null) =>
      (folderIds ?? Object.keys(gamesByFolder)).flatMap((id) => gamesByFolder[id] ?? [])
    ),
    findSources: vi.fn(async () => ({ libretroDatabases: [] })),
    describe: vi.fn(async (games, _sources, onDescribed) => {
      games.forEach((one) => onDescribed(described(one.id)))
    }),
    save: vi.fn(),
    now: () => 50,
    ...overrides
  }
  return { queue: createMetadataQueue(dependencies), dependencies }
}

describe('createMetadataQueue', () => {
  it('describes the games of every folder and writes them, as looked at now', async () => {
    const { queue, dependencies } = queueOver({ f1: [game('a')], f2: [game('b')] })

    queue.request()
    await queue.whenIdle()

    expect(dependencies.listGames).toHaveBeenCalledWith(null)
    expect(dependencies.save).toHaveBeenCalledWith([described('a'), described('b')], 50)
  })

  it('describes only the folders asked for', async () => {
    const { queue, dependencies } = queueOver({ f1: [game('a')], f2: [game('b')] })

    queue.request('f2')
    await queue.whenIdle()

    expect(dependencies.listGames).toHaveBeenCalledWith(['f2'])
    expect(dependencies.save).toHaveBeenCalledWith([described('b')], 50)
  })

  it('writes the games in batches, so main only does short writes', async () => {
    const many = Array.from({ length: 120 }, (_, index) => game(`g${index}`))
    const { queue, dependencies } = queueOver({ f1: many })

    queue.request()
    await queue.whenIdle()

    expect(vi.mocked(dependencies.save).mock.calls.map(([games]) => games.length)).toEqual([
      50, 50, 20
    ])
  })

  it('runs once at a time, joining what is asked for during a run into the next one', async () => {
    let finish = (): void => {}
    const describe = vi.fn(
      (games: GameToDescribe[], _sources, onDescribed: (game: DescribedGame) => void) =>
        new Promise<void>((resolve) => {
          finish = () => {
            games.forEach((one) => onDescribed(described(one.id)))
            resolve()
          }
        })
    )
    const { queue, dependencies } = queueOver(
      { f1: [game('a')], f2: [game('b')], f3: [game('c')] },
      { describe }
    )

    queue.request('f1')
    await vi.waitFor(() => expect(describe).toHaveBeenCalledTimes(1))
    queue.request('f2')
    queue.request('f3')
    finish()
    await vi.waitFor(() => expect(describe).toHaveBeenCalledTimes(2))
    finish()
    await queue.whenIdle()

    expect(dependencies.listGames).toHaveBeenNthCalledWith(2, ['f2', 'f3'])
  })

  it('looks for no sources and starts no worker when there is nothing to describe', async () => {
    const { queue, dependencies } = queueOver({})

    queue.request()
    await queue.whenIdle()

    expect(dependencies.findSources).not.toHaveBeenCalled()
    expect(dependencies.describe).not.toHaveBeenCalled()
  })

  it('stops the run going, keeping what was described before', async () => {
    const describe = vi.fn(
      (
        games: GameToDescribe[],
        _sources,
        onDescribed: (game: DescribedGame) => void,
        signal: AbortSignal
      ) =>
        new Promise<void>((resolve) => {
          onDescribed(described(games[0].id))
          signal.addEventListener('abort', () => resolve())
        })
    )
    const { queue, dependencies } = queueOver({ f1: [game('a'), game('b')] }, { describe })

    queue.request()
    await vi.waitFor(() => expect(describe).toHaveBeenCalled())
    queue.stop()
    await queue.whenIdle()

    expect(dependencies.save).toHaveBeenCalledWith([described('a')], 50)
  })

  it('keeps going after a run fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const findSources = vi
      .fn()
      .mockRejectedValueOnce(new Error('No emulators'))
      .mockResolvedValue({ libretroDatabases: [] })
    const { queue, dependencies } = queueOver({ f1: [game('a')] }, { findSources })

    queue.request()
    await queue.whenIdle()
    queue.request()
    await queue.whenIdle()

    expect(dependencies.save).toHaveBeenCalledTimes(1)
  })
})
