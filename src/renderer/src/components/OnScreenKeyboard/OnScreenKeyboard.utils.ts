import { KEYBOARD_KEYS, PHYSICAL_KEYS } from './OnScreenKeyboard.constants'
import type { KeyboardKey } from './OnScreenKeyboard.types'

/** Unique id of a key, e.g. `q` or `backspace`. */
export function keyId(keyboardKey: KeyboardKey): string {
  return keyboardKey.kind === 'character' ? keyboardKey.value : keyboardKey.kind
}

/** The on-screen key a physical key (`KeyboardEvent.key`) matches, whatever its case. */
export function matchPhysicalKey(key: string): KeyboardKey | undefined {
  if (key in PHYSICAL_KEYS) return PHYSICAL_KEYS[key]
  return KEYBOARD_KEYS.find(
    (keyboardKey) => keyboardKey.kind === 'character' && keyboardKey.value === key.toLowerCase()
  )
}

/** What a character key types: its character, in uppercase while Caps Lock is on. */
export function keyCharacter(value: string, capsLock: boolean): string {
  return capsLock ? value.toUpperCase() : value
}

/** `text` after pressing a key that edits it; Caps Lock and the action key leave it as it is. */
export function typeKey(text: string, keyboardKey: KeyboardKey, capsLock: boolean): string {
  switch (keyboardKey.kind) {
    case 'character':
      return text + keyCharacter(keyboardKey.value, capsLock)
    case 'space':
      return `${text} `
    case 'backspace':
      return text.slice(0, -1)
    default:
      return text
  }
}
