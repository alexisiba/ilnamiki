import type { KeyboardKey } from './OnScreenKeyboard.types'

/** Unique id of a key, e.g. `q` or `backspace`. */
export function keyId(keyboardKey: KeyboardKey): string {
  return keyboardKey.kind === 'character' ? keyboardKey.value : keyboardKey.kind
}

/** What a character key types: its character, in uppercase while shifted. */
export function keyCharacter(value: string, shifted: boolean): string {
  return shifted ? value.toUpperCase() : value
}

/** `text` after pressing a key that edits it; Shift and the action key leave it as it is. */
export function typeKey(text: string, keyboardKey: KeyboardKey, shifted: boolean): string {
  switch (keyboardKey.kind) {
    case 'character':
      return text + keyCharacter(keyboardKey.value, shifted)
    case 'space':
      return `${text} `
    case 'backspace':
      return text.slice(0, -1)
    default:
      return text
  }
}
