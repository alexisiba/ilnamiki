import type { Game } from '@renderer/types/game'

export interface GameCarouselProps {
  games: Game[]
  selectedIndex: number
  /** Id for the status that announces the selected game; it also describes Play now. */
  statusId: string
  onSelect: (index: number) => void
}

export interface GameCarouselItemProps {
  game: Game
  /** Position relative to the selected game: 0 is the selected one, -1 the one before it. */
  offset: number
  onSelect: () => void
}
