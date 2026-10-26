import { launchRandomGame } from '@renderer/core/ipc'

import { usePlay, type PlayGameState } from './usePlay'

/**
 * Plays a game of the library picked at random with its emulator, following it until the
 * emulator closes.
 */
export function usePlayRandomGame(): PlayGameState {
  return usePlay(launchRandomGame)
}
