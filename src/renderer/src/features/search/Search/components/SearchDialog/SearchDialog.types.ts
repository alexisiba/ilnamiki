import type { Game, LibraryGame } from '@renderer/types/game'

export interface SearchDialogProps {
  onClose: () => void
}

export interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  /** Confirming or clicking the field, e.g. to type again over the results. */
  onActivate?: () => void
}

export interface SearchResultsProps {
  /** The text searched, for the message when nothing matches. */
  query: string
  results: Game[]
  onOpen: (game: LibraryGame) => void
}
