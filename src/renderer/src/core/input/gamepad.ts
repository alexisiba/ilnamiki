import type { Direction, InputAction, InputDevice } from './input'

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

/** D-pad buttons in the standard mapping, in the order they win when several are held. */
const DPAD_BUTTONS: [Direction, number][] = [
  ['up', 12],
  ['down', 13],
  ['left', 14],
  ['right', 15]
]

/** How far the left stick must tilt to count as a direction… */
export const STICK_PRESS_THRESHOLD = 0.5
/** …and how far back it must come to release it, so it doesn't flicker around the edge. */
export const STICK_RELEASE_THRESHOLD = 0.35

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

export function isDpadButton(index: number): boolean {
  return DPAD_BUTTONS.some(([, button]) => button === index)
}

/** The d-pad direction held in `pressed` (button states by index), if any. */
export function getDpadDirection(pressed: readonly boolean[]): Direction | undefined {
  return DPAD_BUTTONS.find(([, button]) => pressed[button])?.[0]
}

/**
 * The direction the left stick points to, from its axes (`x` right, `y` down, -1 to 1).
 * Only the dominant axis counts, so there are no diagonals. A new direction needs
 * `STICK_PRESS_THRESHOLD`; the `current` one is kept down to `STICK_RELEASE_THRESHOLD`.
 */
export function getStickDirection(
  x: number,
  y: number,
  current?: Direction
): Direction | undefined {
  const horizontal = Math.abs(x) >= Math.abs(y)
  const value = horizontal ? x : y
  if (Math.abs(value) >= STICK_PRESS_THRESHOLD) {
    if (horizontal) return value > 0 ? 'right' : 'left'
    return value > 0 ? 'down' : 'up'
  }

  const currentValue = { right: x, left: -x, down: y, up: -y }
  if (current && currentValue[current] >= STICK_RELEASE_THRESHOLD) return current
  return undefined
}

/** Indices of the buttons pressed in `current` that were not pressed in `previous`. */
export function getNewlyPressedButtons(
  previous: readonly boolean[],
  current: readonly boolean[]
): number[] {
  return current.flatMap((pressed, index) => (pressed && !previous[index] ? [index] : []))
}
