export interface GameOptionsProps {
  /** The library's id of the game. */
  gameId: string
  /** Its title, heading the panel. */
  title: string
  /** Closes the panel; focus returns where it was. */
  onClose: () => void
}
