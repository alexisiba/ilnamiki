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
}

/** The platforms the user's emulators can play. */
export interface PlatformsApi {
  /**
   * The platforms with an installed core, by name, read from the emulators each time. Empty
   * when no emulator has a core installed or its cores can't be read.
   */
  list(): Promise<InstalledPlatform[]>
}

export const PLATFORMS_CHANNELS = {
  list: 'platforms:list'
} as const
