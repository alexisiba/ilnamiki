/**
 * Fake gamepads for tests. jsdom has no Gamepad API; the setup makes
 * `navigator.getGamepads()` return the gamepads connected here.
 */
const gamepads: Gamepad[] = []

export const XBOX_GAMEPAD_ID =
  'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)'
export const PLAYSTATION_GAMEPAD_ID =
  'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)'

export interface FakeGamepad {
  /** Holds down the button at `index` (standard mapping). */
  press: (index: number) => void
  release: (index: number) => void
  /** Tilts the left stick: `x` right, `y` down, from -1 to 1. */
  tiltStick: (x: number, y: number) => void
  disconnect: () => void
}

export function connectGamepad(id = XBOX_GAMEPAD_ID): FakeGamepad {
  const buttons = Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 }))
  const axes = [0, 0, 0, 0]
  const gamepad = {
    id,
    index: gamepads.length,
    mapping: 'standard',
    connected: true,
    buttons,
    axes,
    timestamp: 0
  } as unknown as Gamepad
  gamepads.push(gamepad)
  // jsdom has no GamepadEvent; listeners only need the event type.
  window.dispatchEvent(new Event('gamepadconnected'))

  return {
    press: (index) => {
      buttons[index] = { pressed: true, touched: true, value: 1 }
    },
    release: (index) => {
      buttons[index] = { pressed: false, touched: false, value: 0 }
    },
    tiltStick: (x, y) => {
      axes[0] = x
      axes[1] = y
    },
    disconnect: () => {
      gamepads.splice(gamepads.indexOf(gamepad), 1)
      window.dispatchEvent(new Event('gamepaddisconnected'))
    }
  }
}

export function getFakeGamepads(): Gamepad[] {
  return gamepads
}

export function disconnectAllGamepads(): void {
  gamepads.length = 0
}
