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
  /** Whether it is the game in front. */
  selected: boolean
  onSelect: () => void
}
