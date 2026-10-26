import type {
  GameDetails,
  GameEnded,
  LaunchGameResult,
  LaunchRandomGameResult,
  RecentlyAddedGame
} from '@shared/api'

/** What the library knows about the game `gameId`, or null when it isn't in the library. */
export function getGameDetails(gameId: string): Promise<GameDetails | null> {
  return window.api.games.getDetails(gameId)
}

/** The 20 games most recently added to the library at most, newest first. */
export function listRecentlyAddedGames(): Promise<RecentlyAddedGame[]> {
  return window.api.games.listRecentlyAdded()
}

/**
 * Starts a game in full screen with the emulator and core it was last played with (or its
 * platform's), or says why it can't. Resolves once the emulator has started;
 * `subscribeToGameEnded` says when it closes.
 */
export function launchGame(gameId: string): Promise<LaunchGameResult> {
  return window.api.games.launch(gameId)
}

/**
 * Starts a game of the library picked at random, as `launchGame` would start it, or says why
 * none started. Resolves once the emulator has started, saying which game it is.
 */
export function launchRandomGame(): Promise<LaunchRandomGameResult> {
  return window.api.games.launchRandom()
}

/** Calls `listener` when the game being played ends. Returns the unsubscribe function. */
export function subscribeToGameEnded(listener: (ended: GameEnded) => void): () => void {
  return window.api.games.onGameEnded(listener)
}
