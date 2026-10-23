import type { KeyboardKey } from './OnScreenKeyboard.types'

const characters = (row: string): KeyboardKey[] =>
  [...row].map((value) => ({ kind: 'character', value }))

/** QWERTY keys in reading order; the keyboard lays them out ten columns wide. */
export const KEYBOARD_KEYS: KeyboardKey[] = [
  ...characters('1234567890'),
  ...characters('qwertyuiop'),
  ...characters('asdfghjklñ'),
  ...characters("zxcvbnm-'"),
  { kind: 'backspace' },
  { kind: 'shift' },
  { kind: 'space' },
  { kind: 'action' }
]
