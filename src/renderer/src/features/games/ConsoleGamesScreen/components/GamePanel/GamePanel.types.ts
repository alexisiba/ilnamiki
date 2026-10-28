import type { LibraryGame } from '@renderer/types/game'
import type { GameBackdrop } from '@renderer/utils/gameArtwork'

export interface GamePanelProps {
  game: LibraryGame
  /** What shows behind the panel: the game's screenshot, or a generic image. */
  backdrop: GameBackdrop
  /** Id of the element that describes Play now (the selected game). */
  describedBy: string
}
