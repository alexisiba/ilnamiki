import type { InputAction } from '@renderer/core/input'

import type { KeyboardKey } from './OnScreenKeyboard.types'

const characters = (row: string): KeyboardKey[] =>
  [...row].map((value) => ({ kind: 'character', value }))

export const CAPS_LOCK_KEY: KeyboardKey = { kind: 'capsLock' }
export const BACKSPACE_KEY: KeyboardKey = { kind: 'backspace' }
export const SPACE_KEY: KeyboardKey = { kind: 'space' }
export const ACTION_KEY: KeyboardKey = { kind: 'action' }

/** QWERTY keys in reading order; the keyboard lays them out ten columns wide. */
export const KEYBOARD_KEYS: KeyboardKey[] = [
  ...characters('1234567890'),
  ...characters('qwertyuiop'),
  ...characters('asdfghjklñ'),
  ...characters('zxcvbnm-'),
  BACKSPACE_KEY,
  CAPS_LOCK_KEY,
  SPACE_KEY,
  ACTION_KEY
]

/**
 * Physical keys (by `KeyboardEvent.key`) that match a key without a character of its own.
 * Enter is left out: it confirms the focused key, so it only matches the action key in the
 * text field.
 */
export const PHYSICAL_KEYS: Record<string, KeyboardKey> = {
  ' ': SPACE_KEY,
  Backspace: BACKSPACE_KEY,
  CapsLock: CAPS_LOCK_KEY
}

/**
 * Keys that also have a button of their own, pressed wherever focus is; each key shows its
 * button. LB and Start are an exception to their fixed meaning while the keyboard is open
 * (see the ilnamiki-ui skill).
 */
export const KEY_SHORTCUTS: { action: InputAction; key: KeyboardKey }[] = [
  { action: 'secondary', key: BACKSPACE_KEY },
  { action: 'tertiary', key: SPACE_KEY },
  { action: 'prevSection', key: CAPS_LOCK_KEY },
  { action: 'menu', key: ACTION_KEY }
]
