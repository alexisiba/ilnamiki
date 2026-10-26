import type {
  CoreRef,
  GameDetails,
  GameEnded,
  GamePlayer,
  LaunchGameResult,
  LaunchRandomGameResult,
  RecentlyAddedGame,
  RecentlyPlayedGame
} from '@shared/api'

/** The 20 games played most recently at most after the last played one, newest first. */
export function listRecentlyPlayedGames(): Promise<RecentlyPlayedGame[]> {
  return window.api.games.listRecentlyPlayed()
}

/**
 * Which cores can play the game `gameId` and which one playing it uses, or null when it isn't
 * in the library.
 */
export function getGamePlayer(gameId: string): Promise<GamePlayer | null> {
  return window.api.games.getPlayer(gameId)
}

/** Keeps `core` as the one the game `gameId` plays with, or forgets the choice with null. */
export function setGameCore(gameId: string, core: CoreRef | null): Promise<void> {
  return window.api.games.setCore(gameId, core)
}

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
