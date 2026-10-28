import { describe, expect, it, vi } from 'vitest'

import type { LastPlayedGame } from '@shared/api'

import {
  emitGameEnded,
  emitMetadataChanged,
  mockLastPlayedGame,
  NO_ARTWORK
} from '@renderer/test/api'

import {
  getLastPlayedGameState,
  refreshLastPlayedGame,
  subscribeToLastPlayedGame
} from './lastPlayedGame'

const CRASH: LastPlayedGame = {
  id: 'g1',
  title: 'Crash Bandicoot',
  platformId: 'playstation',
  artwork: NO_ARTWORK,
  lastPlayedAt: 1_800_000_000_000,
  playtimeMs: 45 * 60 * 1000
}

describe('last played game store', () => {
  it('is loading until the last played game is read', () => {
    expect(getLastPlayedGameState()).toEqual({ status: 'loading', game: null })
  })

  it('reads it when the first subscriber arrives, telling it', async () => {
    mockLastPlayedGame(CRASH)
    const listener = vi.fn()

    subscribeToLastPlayedGame(listener)

    await vi.waitFor(() =>
      expect(getLastPlayedGameState()).toEqual({ status: 'ready', game: CRASH })
    )
    expect(listener).toHaveBeenCalled()
  })

  it('is ready with no game while none was played', async () => {
    subscribeToLastPlayedGame(vi.fn())

    await vi.waitFor(() =>
      expect(getLastPlayedGameState()).toEqual({ status: 'ready', game: null })
    )
  })

  it('reads it only once while subscribers stay', () => {
    subscribeToLastPlayedGame(vi.fn())
    subscribeToLastPlayedGame(vi.fn())

    expect(window.api.games.getLastPlayed).toHaveBeenCalledOnce()
  })

  it('reads it again when a game ends', async () => {
    subscribeToLastPlayedGame(vi.fn())
    await vi.waitFor(() => expect(getLastPlayedGameState().status).toBe('ready'))

    mockLastPlayedGame(CRASH)
    emitGameEnded(CRASH.id)

    await vi.waitFor(() => expect(getLastPlayedGameState().game).toEqual(CRASH))
  })

  it('reads it again when its metadata is found, not another game’s', async () => {
    mockLastPlayedGame(CRASH)
    subscribeToLastPlayedGame(vi.fn())
    await vi.waitFor(() => expect(getLastPlayedGameState().game).toEqual(CRASH))

    emitMetadataChanged('other')
    expect(window.api.games.getLastPlayed).toHaveBeenCalledOnce()

    const described = { ...CRASH, title: 'Crash Bandicoot (described)' }
    mockLastPlayedGame(described)
    emitMetadataChanged('other', CRASH.id)

    await vi.waitFor(() => expect(getLastPlayedGameState().game).toEqual(described))
  })

  it('stops following the games that end and their metadata once no one is subscribed', () => {
    const stopFollowingEnds = vi.fn()
    const stopFollowingMetadata = vi.fn()
    vi.mocked(window.api.games.onGameEnded).mockReturnValue(stopFollowingEnds)
    vi.mocked(window.api.games.onMetadataChanged).mockReturnValue(stopFollowingMetadata)
    const unsubscribe = subscribeToLastPlayedGame(vi.fn())

    unsubscribe()

    expect(stopFollowingEnds).toHaveBeenCalledOnce()
    expect(stopFollowingMetadata).toHaveBeenCalledOnce()
  })

  it('keeps the game read when a later read fails', async () => {
    mockLastPlayedGame(CRASH)
    await refreshLastPlayedGame()

    mockLastPlayedGame(new Error('No database'))
    await refreshLastPlayedGame()

    expect(getLastPlayedGameState()).toEqual({ status: 'failed', game: CRASH })
  })
})
