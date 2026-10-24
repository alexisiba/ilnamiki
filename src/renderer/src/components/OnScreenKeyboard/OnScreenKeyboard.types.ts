export type KeyboardKey =
  { kind: 'character'; value: string } | { kind: 'capsLock' | 'backspace' | 'space' | 'action' }

export interface OnScreenKeyboardProps {
  /** The text being typed; the keyboard reports every change with `onChange`. */
  value: string
  onChange: (value: string) => void
  /** Finishes typing: the action key, the system menu action (Start) or confirming in a field. */
  onSubmit: () => void
  /** Label of the action key, e.g. "Search". */
  actionLabel: string
}

export interface KeyboardKeyButtonProps {
  keyboardKey: KeyboardKey
  actionLabel: string
  /** Whether Caps Lock is on: letters show in uppercase and the Caps Lock key looks active. */
  capsLock: boolean
  /** Whether it shows pressed: while the button that pressed it is down. */
  pressed: boolean
  /** `byConfirm` tells a confirm on the focused key from a pointer click. */
  onPress: (byConfirm: boolean) => void
  onFocus: () => void
  onBlur: () => void
}
