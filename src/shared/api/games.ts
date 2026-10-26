/** Why a game couldn't be started. */
export type LaunchGameProblem =
  /** The game isn't in the library (e.g. it was removed with its folder). */
  | 'unknown-game'
  /** The game's file isn't there anymore (moved, deleted or on a drive that is out). */
  | 'missing-file'
  /** No installed core plays the game's platform, or its emulator is gone. */
  | 'no-core'
  /** Another game is being played: one plays at a time. */
  | 'already-playing'
  /** The emulator couldn't be started (e.g. its application can't run). */
  | 'not-started'

export type LaunchGameResult = { ok: true } | { ok: false; problem: LaunchGameProblem }

/** Why no game was started at random. */
export type LaunchRandomGameProblem =
  /** No game of the library can be played: none has an installed core and its file there. */
  | 'no-games'
  /** Another game is being played: one plays at a time. */
  | 'already-playing'
  /** The emulator couldn't be started (e.g. its application can't run). */
  | 'not-started'

export type LaunchRandomGameResult =
  /** `gameId` is the game started, whose end `onGameEnded` says. */
  { ok: true; gameId: string } | { ok: false; problem: LaunchRandomGameProblem }

/** A game that stopped being played: its emulator closed, however it was closed. */
export interface GameEnded {
  gameId: string
}

/** The game of the library played most recently, with its play history. */
export interface LastPlayedGame {
  id: string
  /** Title shown in the app, never empty. */
  title: string
  /** Platform it belongs to, e.g. "nintendo_64". */
  platformId: string
  /** When it was last played: when its latest session ended, in epoch ms. */
  lastPlayedAt: number
  /** Total time played over all its sessions, in ms. */
  playtimeMs: number
}

/** What the library knows about one of its games. */
export interface GameDetails {
  id: string
  /** Title shown in the app, never empty. */
  title: string
  /** Platform it belongs to, e.g. "nintendo_64". */
  platformId: string
  /** When it was first found in its folder, in epoch ms. */
  addedAt: number
  /** When its latest session ended, in epoch ms; null when it was never played. */
  lastPlayedAt: number | null
  /** Total time played over all its sessions, in ms; 0 when it was never played. */
  playtimeMs: number
}

/** A game of the library, as added from its folder. */
export interface RecentlyAddedGame {
  id: string
  /** Title shown in the app, never empty. */
  title: string
  /** Platform it belongs to, e.g. "nintendo_64". */
  platformId: string
  /** When it was first found in its folder, in epoch ms. */
  addedAt: number
}

/** Playing the games of the user's library. */
export interface GamesApi {
  /**
   * The game of the library played most recently, or null when none of its games was played.
   * Games removed from the library, or of a platform turned off, are left out.
   */
  getLastPlayed(): Promise<LastPlayedGame | null>
  /**
   * The 20 games most recently added to the library at most, newest first; games added
   * together (from the same folder) by title. Empty when the library has none. Games removed
   * from the library, or of a platform turned off, are left out.
   */
  listRecentlyAdded(): Promise<RecentlyAddedGame[]>
  /**
   * What the library knows about the game `gameId`, with its play history, or null when it
   * isn't in the library (e.g. it was removed with its folder).
   */
  getDetails(gameId: string): Promise<GameDetails | null>
  /**
   * Starts the game in full screen with the emulator and core it was last played with, or
   * its platform's when it was never played or those are gone, or says why it can't.
   * Resolves once the emulator has started; `onGameEnded` says when it closes.
   */
  launch(gameId: string): Promise<LaunchGameResult>
  /**
   * Starts a game of the library picked at random, among those of every folder that an
   * installed core plays, whose platform is on and whose file is still there, with the emulator and core `launch`
   * would use; or says why none started. Resolves once the emulator has started; `onGameEnded` says when it closes.
   */
  launchRandom(): Promise<LaunchRandomGameResult>
  /** Calls `listener` when the game being played ends. Returns the unsubscribe function. */
  onGameEnded(listener: (ended: GameEnded) => void): () => void
}

export const GAMES_CHANNELS = {
  getLastPlayed: 'games:get-last-played',
  listRecentlyAdded: 'games:list-recently-added',
  getDetails: 'games:get-details',
  launch: 'games:launch',
  launchRandom: 'games:launch-random',
  gameEnded: 'games:game-ended'
} as const
