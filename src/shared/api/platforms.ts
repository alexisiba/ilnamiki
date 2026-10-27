/** A core installed in one of the user's emulators, which plays one platform. */
export interface InstalledCore {
  /** Stable id of the core within its emulator, e.g. "mupen64plus_next". */
  id: string
  /** Name the core declares, e.g. "Mupen64Plus-Next". */
  name: string
  /** The emulator it is installed in. */
  emulatorId: string
  /**
   * File extensions of the games it plays, lowercase and without the dot (e.g. "n64"), as the
   * core declares them; empty when it doesn't say.
   */
  extensions: string[]
}

/** Which core: one of an emulator's, as `InstalledCore` names it. */
export interface CoreRef {
  /** The emulator it is installed in. */
  emulatorId: string
  /** e.g. "mupen64plus_next". */
  coreId: string
}

/** A platform at least one installed core plays. Its data comes from the emulators. */
export interface InstalledPlatform {
  /** Stable platform id, e.g. "nintendo_64". */
  id: string
  /** e.g. "Nintendo 64". */
  name: string
  /** Company that made it, e.g. "Nintendo"; null when no core says. */
  manufacturer: string | null
  /** The cores that play it, by name; never empty. */
  cores: InstalledCore[]
  /**
   * Whether the user has it on. Every platform starts on; while off, its games are left out of
   * the library, Home and random picks, and nothing about them is deleted.
   */
  isEnabled: boolean
  /**
   * The core the user chose to play its games with, one of `cores`; null while they chose none
   * or the one chosen isn't installed anymore, and its first core is used.
   */
  defaultCore: CoreRef | null
}

/** The platforms the user's emulators can play. */
export interface PlatformsApi {
  /**
   * The platforms with an installed core, by name, read from the emulators each time. Empty
   * when no emulator has a core installed or its cores can't be read.
   */
  list(): Promise<InstalledPlatform[]>
  /** Turns the platform `platformId` on or off, keeping the choice. */
  setEnabled(platformId: string, enabled: boolean): Promise<void>
  /**
   * Keeps `core`, one of the platform's installed cores, as the one its games play with,
   * unless a game was played or set to play with another; null goes back to its first core.
   * Rejects when `core` doesn't play the platform.
   */
  setDefaultCore(platformId: string, core: CoreRef | null): Promise<void>
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
  setDefaultCore: 'platforms:set-default-core',
  getPhoto: 'platforms:get-photo'
} as const
