/** A console in the user's library. Its data comes from the library and is never translated. */
export interface GameConsole {
  id: string
  /** e.g. "PlayStation". */
  name: string
  /** Company that made it, e.g. "Sony". */
  manufacturer: string
  releaseYear: number
  /** Render of the console hardware. */
  imageUrl: string
  /** Number of the user's games installed for it. */
  gameCount: number
}
