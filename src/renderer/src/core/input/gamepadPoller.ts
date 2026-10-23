import {
  getDpadDirection,
  getGamepadButtonAction,
  getGamepadDevice,
  getNewlyPressedButtons,
  getStickDirection,
  isDpadButton
} from './gamepad'
import type { Direction, InputAction, InputDevice } from './input'
import { createDirectionRepeater, type DirectionRepeater } from './repeat'

interface GamepadState {
  /** Pressed state of every button in the previous frame. */
  buttons: boolean[]
  /** Direction the left stick held in the previous frame. */
  stick: Direction | undefined
  repeater: DirectionRepeater
  /** A direction held while the window had no focus; ignored until it is released. */
  directionBlocked: boolean
}

/**
 * Reads the connected gamepads on every animation frame and calls `emit` with their actions:
 * once for each newly pressed button, and for the held direction (d-pad, else left stick)
 * right away and then repeatedly while it stays held. Input while the window has no focus is
 * ignored, also once focus returns with it still held. Returns the function that stops polling.
 */
export function startGamepadPolling(
  emit: (action: InputAction, device: InputDevice) => void
): () => void {
  const states = new Map<number, GamepadState>()

  const poll = (time: number): void => {
    const focused = document.hasFocus()
    const present = new Set<number>()

    for (const gamepad of navigator.getGamepads()) {
      if (!gamepad) continue
      present.add(gamepad.index)

      let state = states.get(gamepad.index)
      if (!state) {
        state = {
          buttons: [],
          stick: undefined,
          repeater: createDirectionRepeater(),
          directionBlocked: false
        }
        states.set(gamepad.index, state)
      }

      const device = getGamepadDevice(gamepad.id)
      const pressed = gamepad.buttons.map((button) => button.pressed)

      if (focused) {
        for (const index of getNewlyPressedButtons(state.buttons, pressed)) {
          const action = isDpadButton(index) ? undefined : getGamepadButtonAction(index)
          if (action) emit(action, device)
        }
      }
      state.buttons = pressed

      state.stick = getStickDirection(gamepad.axes[0] ?? 0, gamepad.axes[1] ?? 0, state.stick)
      const held = getDpadDirection(pressed) ?? state.stick
      if (!held) state.directionBlocked = false
      else if (!focused) state.directionBlocked = true

      const direction = state.repeater.update(state.directionBlocked ? undefined : held, time)
      if (direction) emit(direction, device)
    }

    // Forget disconnected gamepads, so a reconnected one starts from a clean state.
    for (const index of states.keys()) if (!present.has(index)) states.delete(index)

    frame = requestAnimationFrame(poll)
  }

  let frame = requestAnimationFrame(poll)
  return () => cancelAnimationFrame(frame)
}
