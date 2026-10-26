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

/** Playing the games of the user's library. */
export interface GamesApi {
  /**
   * The game of the library played most recently, or null when none of its games was played.
   * Games removed from the library are left out.
   */
  getLastPlayed(): Promise<LastPlayedGame | null>
  /**
   * Starts the game in full screen with its platform's emulator, or says why it can't.
   * Resolves once the emulator has started; `onGameEnded` says when it closes.
   */
  launch(gameId: string): Promise<LaunchGameResult>
  /** Calls `listener` when the game being played ends. Returns the unsubscribe function. */
  onGameEnded(listener: (ended: GameEnded) => void): () => void
}

export const GAMES_CHANNELS = {
  getLastPlayed: 'games:get-last-played',
  launch: 'games:launch',
  gameEnded: 'games:game-ended'
} as const
