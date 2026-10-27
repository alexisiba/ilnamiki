/**
 * One of the user's emulators, played one way, that plays a platform. Most emulators play a
 * platform one way only; some have several options for it (e.g. RetroArch).
 */
export interface PlatformEmulator {
  /** The emulator, one the user added. */
  emulatorId: string
  /** The emulator's name, as the user sees it, e.g. "RetroArch". */
  emulatorName: string
  /**
   * Which of the emulator's options plays the platform (e.g. "mupen64plus_next"); null when
   * the emulator has no options. Meaningful only to its emulator.
   */
  optionId: string | null
  /** Name of the option, shown after the emulator's (e.g. "Mupen64Plus-Next"); null without one. */
  optionName: string | null
  /**
   * File extensions of the games it plays, lowercase and without the dot (e.g. "n64"), as the
   * emulator declares them; empty when it doesn't say.
   */
  extensions: string[]
}

/** Which emulator, and which of its options, as `PlatformEmulator` names them. */
export interface EmulatorChoice {
  emulatorId: string
  /** e.g. "mupen64plus_next"; null for an emulator without options. */
  optionId: string | null
}

/** A platform at least one of the user's emulators plays. Its data comes from the emulators. */
export interface InstalledPlatform {
  /** Stable platform id, e.g. "nintendo_64". */
  id: string
  /** e.g. "Nintendo 64". */
  name: string
  /** Company that made it, e.g. "Nintendo"; null when no emulator says. */
  manufacturer: string | null
  /** The emulators that play it, by emulator name and then option name; never empty. */
  emulators: PlatformEmulator[]
  /**
   * Whether the user has it on. Every platform starts on; while off, its games are left out of
   * the library, Home and random picks, and nothing about them is deleted.
   */
  isEnabled: boolean
  /**
   * The emulator the user chose to play its games with, one of `emulators`; null while they
   * chose none or the one chosen doesn't play it anymore, and its first emulator is used.
   */
  defaultEmulator: EmulatorChoice | null
}

/** The platforms the user's emulators can play. */
export interface PlatformsApi {
  /**
   * The platforms the user's emulators play, by name, read from the emulators each time. Empty
   * when no emulator plays any or what they play can't be read.
   */
  list(): Promise<InstalledPlatform[]>
  /** Turns the platform `platformId` on or off, keeping the choice. */
  setEnabled(platformId: string, enabled: boolean): Promise<void>
  /**
   * Keeps `emulator`, one of the platform's emulators, as the one its games play with, unless
   * a game was played or set to play with another; null goes back to its first emulator.
   * Rejects when `emulator` doesn't play the platform.
   */
  setDefaultEmulator(platformId: string, emulator: EmulatorChoice | null): Promise<void>
  /**
   * A photo of the console of the platform `platformId`, as a `data:` URL of a PNG with a
   * transparent background. It is downloaded the first time and kept, so it shows offline
   * afterward. Null when the app has no photo for the platform or it can't be downloaded now.
   */
  getPhoto(platformId: string): Promise<string | null>
}

export const PLATFORMS_CHANNELS = {
  list: 'platforms:list',
  setEnabled: 'platforms:set-enabled',
  setDefaultEmulator: 'platforms:set-default-emulator',
  getPhoto: 'platforms:get-photo'
} as const
