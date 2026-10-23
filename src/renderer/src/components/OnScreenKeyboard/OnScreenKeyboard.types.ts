export type KeyboardKey =
  { kind: 'character'; value: string } | { kind: 'shift' | 'backspace' | 'space' | 'action' }

export interface OnScreenKeyboardProps {
  /** Label of the key that finishes typing, e.g. "Search". */
  actionLabel: string
}

export interface KeyboardKeyButtonProps {
  keyboardKey: KeyboardKey
  actionLabel: string
}
