import type { KeyboardKey } from './OnScreenKeyboard.types'

const characters = (row: string): KeyboardKey[] =>
  [...row].map((value) => ({ kind: 'character', value }))

export const SHIFT_KEY: KeyboardKey = { kind: 'shift' }
export const BACKSPACE_KEY: KeyboardKey = { kind: 'backspace' }
export const ACTION_KEY: KeyboardKey = { kind: 'action' }

/** QWERTY keys in reading order; the keyboard lays them out ten columns wide. */
export const KEYBOARD_KEYS: KeyboardKey[] = [
  ...characters('1234567890'),
  ...characters('qwertyuiop'),
  ...characters('asdfghjklñ'),
  ...characters("zxcvbnm-'"),
  BACKSPACE_KEY,
  SHIFT_KEY,
  { kind: 'space' },
  ACTION_KEY
]
