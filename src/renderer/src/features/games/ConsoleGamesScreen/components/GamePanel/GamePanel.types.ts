import type { Game } from '@renderer/types/game'

export interface GamePanelProps {
  game: Game
  /** Id of the element that describes Play now (the selected game). */
  describedBy: string
}
