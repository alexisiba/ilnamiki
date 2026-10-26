import { launchGame } from '@renderer/core/ipc'

import { usePlay, type PlayGameState } from './usePlay'

/** Plays the game `gameId` with its emulator, following it until the emulator closes. */
export function usePlayGame(gameId: string): PlayGameState {
  return usePlay(async () => {
    const result = await launchGame(gameId)
    return result.ok ? { ok: true, gameId } : result
  })
}
