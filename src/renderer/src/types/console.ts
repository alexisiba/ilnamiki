/**
 * A console in the user's library: an installed platform with games. Its data comes from the
 * emulators, the library and the app's catalog, and is never translated.
 */
export interface GameConsole {
  /** The platform's id, e.g. "playstation". */
  id: string
  /** e.g. "PlayStation". */
  name: string
  /** Company that made it, e.g. "Sony"; null when not known. */
  manufacturer: string | null
  /** Year it was first released; null when not known. */
  releaseYear: number | null
  /** Render of the console hardware; null when the app has none. */
  imageUrl: string | null
  /** Number of the user's games installed for it. */
  gameCount: number
}
