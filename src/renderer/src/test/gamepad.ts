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
  disconnect: () => void
}

export function connectGamepad(id = XBOX_GAMEPAD_ID): FakeGamepad {
  const buttons = Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 }))
  const gamepad = {
    id,
    index: gamepads.length,
    mapping: 'standard',
    connected: true,
    buttons,
    axes: [0, 0, 0, 0],
    timestamp: 0
  } as unknown as Gamepad
  gamepads.push(gamepad)

  return {
    press: (index) => {
      buttons[index] = { pressed: true, touched: true, value: 1 }
    },
    release: (index) => {
      buttons[index] = { pressed: false, touched: false, value: 0 }
    },
    disconnect: () => {
      gamepads.splice(gamepads.indexOf(gamepad), 1)
    }
  }
}

export function getFakeGamepads(): Gamepad[] {
  return gamepads
}

export function disconnectAllGamepads(): void {
  gamepads.length = 0
}
