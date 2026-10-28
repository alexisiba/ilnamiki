import type { EmulatorInstallation } from '../installation'

/** A core installed in RetroArch, with the platform it plays. */
export interface RetroArchCore {
  /** e.g. "mupen64plus_next". */
  id: string
  /** e.g. "Mupen64Plus-Next". */
  name: string
  /** e.g. "nintendo_64". */
  platformId: string
  /** e.g. "Nintendo 64". */
  platformName: string
  /** Company that made the platform, e.g. "Nintendo"; null when the core doesn't say. */
  platformManufacturer: string | null
  /** Lowercase, without the dot. */
  extensions: string[]
  /** Names of the game databases of its platform, e.g. "Nintendo - Nintendo 64"; may be empty. */
  databases: string[]
}

/** How an operating system reads the cores installed in RetroArch. */
export interface RetroArchCoresReader {
  /** The cores installed in `installation`; empty when none are or they can't be read. */
  readCores(installation: EmulatorInstallation): Promise<RetroArchCore[]>
  /**
   * Absolute path of the library of the core `coreId` in `installation`, the file RetroArch
   * loads to play; null when it isn't there.
   */
  findCoreLibrary(installation: EmulatorInstallation, coreId: string): Promise<string | null>
  /**
   * Absolute path of the folder of RetroArch's game databases (`.rdb` files) in
   * `installation`, as its configuration sets it; null when it can't be known.
   */
  findDatabaseFolder(installation: EmulatorInstallation): Promise<string | null>
}
