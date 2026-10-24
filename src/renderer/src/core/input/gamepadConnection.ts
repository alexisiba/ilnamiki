/**
 * Whether at least one gamepad is connected. Browsers only expose a gamepad once one of its
 * buttons is pressed with the window focused, so this turns true on that first press.
 */
export function isGamepadConnected(): boolean {
  return navigator.getGamepads().some((gamepad) => gamepad !== null)
}

/** Calls `listener` whenever a gamepad connects or disconnects. Returns the unsubscribe function. */
export function subscribeToGamepadConnection(listener: () => void): () => void {
  window.addEventListener('gamepadconnected', listener)
  window.addEventListener('gamepaddisconnected', listener)

  return () => {
    window.removeEventListener('gamepadconnected', listener)
    window.removeEventListener('gamepaddisconnected', listener)
  }
}
