export type Direction = 'up' | 'down' | 'left' | 'right'

/**
 * Semantic actions features react to.
 *
 * - Fixed (same meaning everywhere): directions, `confirm`, `back`, `prevSection` /
 *   `nextSection` (top-level sections) and `menu`.
 * - Contextual (each screen decides and labels them): `secondary`, `tertiary` and
 *   `prevGroup` / `nextGroup` (groups inside the current section).
 */
export type InputAction =
  | Direction
  | 'confirm'
  | 'back'
  | 'prevSection'
  | 'nextSection'
  | 'menu'
  | 'secondary'
  | 'tertiary'
  | 'prevGroup'
  | 'nextGroup'

export function isDirection(action: InputAction): action is Direction {
  return action === 'up' || action === 'down' || action === 'left' || action === 'right'
}

export type InputDevice = 'xbox' | 'playstation' | 'keyboard'

/**
 * Keyboard bindings by `KeyboardEvent.key`, with single characters lowercased.
 * Gamepad bindings will map to the same actions.
 */
export const KEYBOARD_BINDINGS: Record<string, InputAction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Enter: 'confirm',
  ' ': 'confirm',
  Escape: 'back',
  q: 'prevSection',
  e: 'nextSection',
  m: 'menu',
  x: 'secondary',
  y: 'tertiary',
  PageUp: 'prevGroup',
  PageDown: 'nextGroup'
}

export function getKeyboardAction(key: string): InputAction | undefined {
  return KEYBOARD_BINDINGS[key.length === 1 ? key.toLowerCase() : key]
}
