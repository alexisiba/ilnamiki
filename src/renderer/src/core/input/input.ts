export type InputAction = 'up' | 'down' | 'left' | 'right' | 'confirm' | 'back'

/** Keyboard bindings by `KeyboardEvent.key`. Gamepad bindings will map to the same actions. */
export const KEYBOARD_BINDINGS: Record<string, InputAction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Enter: 'confirm',
  ' ': 'confirm',
  Escape: 'back',
  Backspace: 'back'
}
