/**
 * A game in the user's library, with what is known about it so far: its metadata is null until
 * it is found. Its data comes from the library and is never translated.
 */
export interface LibraryGame {
  id: string
  title: string
  /** Its artwork; null when there is none, and a generic image shows instead. */
  imageUrl: string | null
  releaseYear: number | null
  genre: string | null
  /** Maximum number of players. */
  players: number | null
  description: string | null
}

/** A game with all its metadata and play history, as the sample library has it. */
export interface Game extends LibraryGame {
  /** Console it runs on, e.g. "Nintendo 64". */
  platform: string
  imageUrl: string
  releaseYear: number
  genre: string
  players: number
  description: string
  lastPlayedAt: Date
  playtimeMinutes: number
}
