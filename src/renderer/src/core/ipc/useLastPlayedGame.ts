import { useSyncExternalStore } from 'react'

import {
  getLastPlayedGameState,
  subscribeToLastPlayedGame,
  type LastPlayedGameState
} from './lastPlayedGame'

/**
 * The game of the library played most recently, read from main when the first component
 * using it mounts, and again whenever a game ends.
 */
export function useLastPlayedGame(): LastPlayedGameState {
  return useSyncExternalStore(subscribeToLastPlayedGame, getLastPlayedGameState)
}
