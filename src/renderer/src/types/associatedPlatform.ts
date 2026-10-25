/**
 * A platform an emulator plays, with the core that plays it. Its data comes from the emulator
 * and is never translated.
 */
export interface AssociatedPlatform {
  /** Stable platform id, e.g. "nintendo_64". */
  id: string
  /** e.g. "Nintendo 64". */
  name: string
  /** Name of the core that plays it, e.g. "Mupen64Plus-Next". */
  core: string
  /**
   * File extensions of the games the core plays, lowercase and without the dot (e.g. "n64"),
   * as the core declares them; empty when it doesn't say.
   */
  extensions: string[]
  /** Whether its games can be played. */
  enabled: boolean
}
