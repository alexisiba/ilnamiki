export interface PathFieldProps {
  label: string
  /** Accessible name of the button that opens the picker, e.g. "Choose the folder". */
  browseLabel: string
  value: string
  onChange: (value: string) => void
  /** Opens the system's picker: the chosen path, or null when the user cancels. */
  pick: () => Promise<string | null>
  /** Called with the path chosen in the picker, after `onChange`. */
  onPick?: (path: string) => void
  /** A problem with the path to show below it, e.g. that the file isn't allowed to run. */
  error?: string
  autoFocus?: boolean
}

export interface BrowseButtonProps {
  label: string
  onPress: () => void
}
