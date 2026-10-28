import type { EmulatorChoice, PlatformEmulator } from './platforms'

/** Why a game couldn't be started. */
export type LaunchGameProblem =
  /** The game isn't in the library (e.g. it was removed with its folder). */
  | 'unknown-game'
  /** The game's file isn't there anymore (moved, deleted or on a drive that is out). */
  | 'missing-file'
  /** None of the user's emulators plays the game's platform anymore. */
  | 'no-emulator'
  /** Another game is being played: one plays at a time. */
  | 'already-playing'
  /** The emulator couldn't be started (e.g. its application can't run). */
  | 'not-started'

export type LaunchGameResult = { ok: true } | { ok: false; problem: LaunchGameProblem }

/** Why no game was started at random. */
export type LaunchRandomGameProblem =
  /** No game of the library can be played: none has an emulator and its file there. */
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

/**
 * A game's images, as URLs an `<img>` shows; null for each kind it has none of (not found yet,
 * or no source has it), where the UI shows a generic image instead.
 */
export interface GameArtwork {
  /** Its box's front. */
  cover: string | null
  /** Its title screen. */
  titleScreen: string | null
  /** A moment of play, at the console's own resolution. */
  screenshot: string | null
}

/** The game of the library played most recently, with its play history. */
export interface LastPlayedGame {
  id: string
  /** Title shown in the app, never empty. */
  title: string
  /** Platform it belongs to, e.g. "nintendo_64". */
  platformId: string
  artwork: GameArtwork
  /** When it was last played: when its latest session ended, in epoch ms. */
  lastPlayedAt: number
  /** Total time played over all its sessions, in ms. */
  playtimeMs: number
}

/**
 * What the library knows about one of its games. What comes from its metadata (year, genre…)
 * is null while unknown, and is shown as it is, never translated.
 */
export interface GameDetails {
  id: string
  /** Title shown in the app, never empty. */
  title: string
  /** Platform it belongs to, e.g. "nintendo_64". */
  platformId: string
  artwork: GameArtwork
  /** Year it came out. */
  releaseYear: number | null
  /** e.g. "Platform". */
  genre: string | null
  /** Who made it. */
  developer: string | null
  /** Who published it. */
  publisher: string | null
  /** Most players at once, 1 or more. */
  players: number | null
  /** When it was first found in its folder, in epoch ms. */
  addedAt: number
  /** When its latest session ended, in epoch ms; null when it was never played. */
  lastPlayedAt: number | null
  /** Total time played over all its sessions, in ms; 0 when it was never played. */
  playtimeMs: number
}

/**
 * Why a game plays with the emulator it does, in the order they are tried:
 * - `game`: the user chose it for this game.
 * - `last-session`: the game was last played with it, so its progress is found: save states
 *   only load in the emulator that made them, and RetroArch may keep saves apart by option.
 * - `platform-default`: the user chose it for the game's platform.
 * - `first-installed`: nothing was chosen; the platform's first emulator, by name.
 * An emulator that doesn't play the platform anymore is passed over for the next.
 */
export type GameEmulatorReason = 'game' | 'last-session' | 'platform-default' | 'first-installed'

/** Which emulators can play a game, and which one playing it uses. */
export interface GamePlayer {
  /** The emulators that play its platform, by name; empty when none does. */
  emulators: PlatformEmulator[]
  /** The emulator the user chose for this game, one of `emulators`; null while they chose none. */
  chosenEmulator: EmulatorChoice | null
  /** The emulator playing it uses now, and why; null when none plays it. */
  playsWith: { emulator: EmulatorChoice; reason: GameEmulatorReason } | null
}

/** A game of the library that was played, as a row of games played before shows it. */
export interface RecentlyPlayedGame {
  id: string
  /** Title shown in the app, never empty. */
  title: string
  /** Platform it belongs to, e.g. "nintendo_64". */
  platformId: string
  artwork: GameArtwork
  /** When it was last played: when its latest session ended, in epoch ms. */
  lastPlayedAt: number
}

/** A game of the library, as added from its folder. */
export interface RecentlyAddedGame {
  id: string
  /** Title shown in the app, never empty. */
  title: string
  /** Platform it belongs to, e.g. "nintendo_64". */
  platformId: string
  artwork: GameArtwork
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
   * The 20 games played most recently at most after the one `getLastPlayed` returns, newest
   * first. Empty while fewer than two games were played. Games removed from the library, or
   * of a platform turned off, are left out, as `getLastPlayed` leaves them out.
   */
  listRecentlyPlayed(): Promise<RecentlyPlayedGame[]>
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
   * Which emulators can play the game `gameId` and which one `launch` would use, or null when
   * it isn't in the library.
   */
  getPlayer(gameId: string): Promise<GamePlayer | null>
  /**
   * Keeps `emulator`, one of the emulators of the game's platform, as the one it plays with,
   * over every other reason; null forgets the choice. Rejects when the game isn't in the
   * library or `emulator` doesn't play its platform.
   */
  setEmulator(gameId: string, emulator: EmulatorChoice | null): Promise<void>
  /**
   * Starts the game in full screen with the emulator `getPlayer` says it plays with, or says
   * why it can't. Resolves once the emulator has started; `onGameEnded` says when it closes.
   */
  launch(gameId: string): Promise<LaunchGameResult>
  /**
   * Starts a game of the library picked at random, among those of every folder that one of
   * the user's emulators plays, whose platform is on and whose file is still there, with the
   * emulator `launch` would use; or says why none started. Resolves once the emulator has
   * started; `onGameEnded` says when it closes.
   */
  launchRandom(): Promise<LaunchRandomGameResult>
  /** Calls `listener` when the game being played ends. Returns the unsubscribe function. */
  onGameEnded(listener: (ended: GameEnded) => void): () => void
}

export const GAMES_CHANNELS = {
  getLastPlayed: 'games:get-last-played',
  listRecentlyPlayed: 'games:list-recently-played',
  listRecentlyAdded: 'games:list-recently-added',
  getDetails: 'games:get-details',
  getPlayer: 'games:get-player',
  setEmulator: 'games:set-emulator',
  launch: 'games:launch',
  launchRandom: 'games:launch-random',
  gameEnded: 'games:game-ended'
} as const
