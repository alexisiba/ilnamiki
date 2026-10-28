import type { LibraryGame } from '@renderer/types/game'

export interface GamePanelProps {
  game: LibraryGame
  /** Id of the element that describes Play now (the selected game). */
  describedBy: string
}
