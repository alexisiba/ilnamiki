import { getGamepadButtonAction, getGamepadDevice, getNewlyPressedButtons } from './gamepad'
import type { InputAction, InputDevice } from './input'

/**
 * Reads the connected gamepads on every animation frame and calls `emit` with the action of
 * each newly pressed button. Presses while the window has no focus are ignored, also once
 * focus returns with the button still held. Returns the function that stops polling.
 */
export function startGamepadPolling(
  emit: (action: InputAction, device: InputDevice) => void
): () => void {
  /** Pressed state of every button in the previous frame, by gamepad index. */
  const previous = new Map<number, boolean[]>()

  const poll = (): void => {
    const focused = document.hasFocus()
    const present = new Set<number>()

    for (const gamepad of navigator.getGamepads()) {
      if (!gamepad) continue
      present.add(gamepad.index)

      const pressed = gamepad.buttons.map((button) => button.pressed)
      if (focused) {
        const device = getGamepadDevice(gamepad.id)
        for (const index of getNewlyPressedButtons(previous.get(gamepad.index) ?? [], pressed)) {
          const action = getGamepadButtonAction(index)
          if (action) emit(action, device)
        }
      }
      previous.set(gamepad.index, pressed)
    }

    // Forget disconnected gamepads, so a reconnected one starts from a clean state.
    for (const index of previous.keys()) if (!present.has(index)) previous.delete(index)

    frame = requestAnimationFrame(poll)
  }

  let frame = requestAnimationFrame(poll)
  return () => cancelAnimationFrame(frame)
}
