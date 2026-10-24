/** A game in the user's library. Its data comes from the library and is never translated. */
export interface Game {
  id: string
  title: string
  /** Console it runs on, e.g. "Nintendo 64". */
  platform: string
  imageUrl: string
  releaseYear: number
  genre: string
  /** Maximum number of players. */
  players: number
  description: string
  lastPlayedAt: Date
  playtimeMinutes: number
}
