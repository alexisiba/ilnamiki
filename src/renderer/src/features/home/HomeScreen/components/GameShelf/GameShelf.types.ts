export interface ShelfGame {
  id: string
  title: string
  platform: string
  imageUrl: string
  /** Optional secondary line under the title, e.g. when it was last played. */
  caption?: string
}

export interface GameShelfProps {
  /** Focus group id, unique across the app. */
  id: string
  title: string
  games: ShelfGame[]
  /** Called with the game's id when a card is confirmed. */
  onSelectGame: (gameId: string) => void
}

export interface GameShelfCardProps {
  game: ShelfGame
  onSelect: () => void
}
