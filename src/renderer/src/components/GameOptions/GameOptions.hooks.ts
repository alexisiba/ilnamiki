import { useEffect, useState } from 'react'

import type { CoreRef, GamePlayer } from '@shared/api'

import { getGamePlayer, setGameCore } from '@renderer/core/ipc'

export interface GamePlayerState {
  /** `loading` until main first answers, `failed` when it can't. */
  status: 'loading' | 'ready' | 'failed'
  /** Null when the game isn't in the library, or until it is read. */
  player: GamePlayer | null
  /**
   * Keeps `core` as the one the game plays with (null goes back to the usual order), then
   * reads which core it plays with again. Rejects when main can't keep it, changing nothing.
   */
  choose: (core: CoreRef | null) => Promise<void>
}

/** Which cores can play the game `gameId` and which one it plays with, read on mount. */
export function useGamePlayer(gameId: string): GamePlayerState {
  const [state, setState] = useState<Omit<GamePlayerState, 'choose'>>({
    status: 'loading',
    player: null
  })

  useEffect(() => {
    let active = true
    getGamePlayer(gameId).then(
      (player) => {
        if (active) setState({ status: 'ready', player })
      },
      () => {
        if (active) setState({ status: 'failed', player: null })
      }
    )
    return () => {
      active = false
    }
  }, [gameId])

  const choose = async (core: CoreRef | null): Promise<void> => {
    await setGameCore(gameId, core)
    setState({ status: 'ready', player: await getGamePlayer(gameId) })
  }

  return { ...state, choose }
}
