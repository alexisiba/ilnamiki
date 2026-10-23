import type { InputAction, InputDevice } from './input'

/** The kinds of gamepad the app tells apart, to draw the right button glyphs. */
export type GamepadDevice = Exclude<InputDevice, 'keyboard'>

/**
 * Actions by button index, following the Gamepad API "standard" mapping (Xbox layout:
 * 0 A, 1 B, 2 X, 3 Y, 4 LB, 5 RB, 6 LT, 7 RT, 9 Menu, 12–15 d-pad).
 */
const BUTTON_ACTIONS: Partial<Record<number, InputAction>> = {
  0: 'confirm',
  1: 'back',
  2: 'secondary',
  3: 'tertiary',
  4: 'prevSection',
  5: 'nextSection',
  6: 'prevGroup',
  7: 'nextGroup',
  9: 'menu',
  12: 'up',
  13: 'down',
  14: 'left',
  15: 'right'
}

/**
 * Sony vendor id and the names Sony controllers report on each platform. A DualShock 4 is
 * often just "Wireless Controller", so that name only counts at the start of the id (an
 * "Xbox Wireless Controller" contains it too).
 */
const PLAYSTATION_ID = /054c|sony|dualshock|dualsense|playstation|^wireless controller/i

export function getGamepadButtonAction(index: number): InputAction | undefined {
  return BUTTON_ACTIONS[index]
}

/** PlayStation for Sony controllers; Xbox for everything else, including generic ones. */
export function getGamepadDevice(id: string): GamepadDevice {
  return PLAYSTATION_ID.test(id) ? 'playstation' : 'xbox'
}

/** Indices of the buttons pressed in `current` that were not pressed in `previous`. */
export function getNewlyPressedButtons(
  previous: readonly boolean[],
  current: readonly boolean[]
): number[] {
  return current.flatMap((pressed, index) => (pressed && !previous[index] ? [index] : []))
}
