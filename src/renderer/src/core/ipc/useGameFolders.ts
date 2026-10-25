import { useSyncExternalStore } from 'react'

import { getGameFoldersState, subscribeToGameFolders, type GameFoldersState } from './gameFolders'

/**
 * The game folders the user added, read from main when the first component using them
 * mounts, and again whenever one is added.
 */
export function useGameFolders(): GameFoldersState {
  return useSyncExternalStore(subscribeToGameFolders, getGameFoldersState)
}
