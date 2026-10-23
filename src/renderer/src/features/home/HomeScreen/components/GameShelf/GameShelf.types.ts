export interface ShelfGame {
  id: string
  title: string
  platform: string
  imageUrl: string
  /** Optional secondary line under the title, e.g. when it was last played. */
  caption?: string
}

export interface GameShelfProps {
  title: string
  games: ShelfGame[]
}

export interface GameShelfCardProps {
  game: ShelfGame
}
