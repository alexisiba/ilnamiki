/** A core found installed in an emulator, with the platform it plays. */
export interface DetectedCore {
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
}

/** The cores one emulator has installed. */
export interface EmulatorCores {
  emulatorId: string
  cores: DetectedCore[]
}

/** How an operating system reads the cores installed in an emulator. */
export interface CoresReader {
  /**
   * The cores installed in the RetroArch whose application is at `executablePath`; empty when
   * none are or they can't be read.
   */
  readRetroArchCores(executablePath: string): Promise<DetectedCore[]>
}
