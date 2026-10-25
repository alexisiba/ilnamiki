import type { GameEnded, LaunchGameResult } from '@shared/api'

/**
 * Starts a game in full screen with its platform's emulator, or says why it can't. Resolves
 * once the emulator has started; `subscribeToGameEnded` says when it closes.
 */
export function launchGame(gameId: string): Promise<LaunchGameResult> {
  return window.api.games.launch(gameId)
}

/** Calls `listener` when the game being played ends. Returns the unsubscribe function. */
export function subscribeToGameEnded(listener: (ended: GameEnded) => void): () => void {
  return window.api.games.onGameEnded(listener)
}
