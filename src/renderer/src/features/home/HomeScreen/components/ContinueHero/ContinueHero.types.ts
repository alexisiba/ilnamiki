/** The game to continue, as the hero shows it. */
export interface ContinueGame {
  /** The library's id of the game, to play it. */
  id: string
  title: string
  /** Console it runs on, e.g. "Nintendo 64". */
  platform: string
  /** Null while the game has no metadata. */
  description: string | null
  /** Its screenshot, or a generic image while it has none. */
  imageUrl: string
  /** Whether the image is a capture at the console's resolution, drawn with sharp pixels. */
  isPixelArt: boolean
  lastPlayedAt: Date
  playtimeMinutes: number
}

export interface ContinueHeroProps {
  game: ContinueGame
}
