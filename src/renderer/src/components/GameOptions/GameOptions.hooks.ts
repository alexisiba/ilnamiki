import { useEffect, useState } from 'react'

import type { EmulatorChoice, GamePlayer } from '@shared/api'

import { getGamePlayer, setGameEmulator } from '@renderer/core/ipc'

export interface GamePlayerState {
  /** `loading` until main first answers, `failed` when it can't. */
  status: 'loading' | 'ready' | 'failed'
  /** Null when the game isn't in the library, or until it is read. */
  player: GamePlayer | null
  /**
   * Keeps `emulator` as the one the game plays with (null goes back to the usual order), then
   * reads which emulator it plays with again. Rejects when main can't keep it, changing
   * nothing.
   */
  choose: (emulator: EmulatorChoice | null) => Promise<void>
}

/** Which emulators can play the game `gameId` and which one it plays with, read on mount. */
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

  const choose = async (emulator: EmulatorChoice | null): Promise<void> => {
    await setGameEmulator(gameId, emulator)
    setState({ status: 'ready', player: await getGamePlayer(gameId) })
  }

  return { ...state, choose }
}
