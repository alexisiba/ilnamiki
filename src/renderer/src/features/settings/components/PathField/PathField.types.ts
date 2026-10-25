export interface PathFieldProps {
  label: string
  /** Accessible name of the button that opens the picker, e.g. "Choose the folder". */
  browseLabel: string
  value: string
  onChange: (value: string) => void
  /** Opens the system's picker: the chosen path, or null when the user cancels. */
  pick: () => Promise<string | null>
  autoFocus?: boolean
}

export interface BrowseButtonProps {
  label: string
  onPress: () => void
}
