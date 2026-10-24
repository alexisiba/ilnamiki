import {
  getDpadDirection,
  getGamepadButtonAction,
  getGamepadDevice,
  getNewlyPressedButtons,
  getStickDirection,
  isDpadButton
} from './gamepad'
import type { Direction, InputAction, InputDevice, InputPhase } from './input'
import {
  createDirectionRepeater,
  REPEAT_DELAY_MS,
  REPEAT_INTERVAL_MS,
  type DirectionRepeater
} from './repeat'

interface GamepadState {
  device: InputDevice
  /** Pressed state of every button in the previous frame. */
  buttons: boolean[]
  /** Buttons whose press was emitted and still owe their release, with their action. */
  pressedActions: Map<number, InputAction>
  /** Direction the left stick held in the previous frame. */
  stick: Direction | undefined
  /** Direction emitted for in the previous frame, to tell its repeats apart. */
  direction: Direction | undefined
  repeater: DirectionRepeater
  /** A direction held while the window had no focus; ignored until it is released. */
  directionBlocked: boolean
  /** The newest held button that isn't a direction, and when it repeats next. */
  heldButton: { index: number; action: InputAction; nextAt: number } | undefined
}

/**
 * Reads the connected gamepads on every animation frame and calls `emit` with their actions:
 * once for each newly pressed button, and for the held direction (d-pad, else left stick)
 * right away. While held, the direction and the newest other button repeat; buttons other
 * than directions report their release. Presses while the window has no focus are ignored,
 * also once focus returns with them still held. Returns the function that stops polling.
 */
export function startGamepadPolling(
  emit: (action: InputAction, device: InputDevice, phase?: InputPhase) => void
): () => void {
  const states = new Map<number, GamepadState>()

  const releaseButton = (state: GamepadState, index: number): void => {
    const action = state.pressedActions.get(index)
    if (!action) return
    state.pressedActions.delete(index)
    emit(action, state.device, 'release')
  }

  const poll = (time: number): void => {
    const focused = document.hasFocus()
    const present = new Set<number>()

    for (const gamepad of navigator.getGamepads()) {
      if (!gamepad) continue
      present.add(gamepad.index)

      let state = states.get(gamepad.index)
      if (!state) {
        state = {
          device: getGamepadDevice(gamepad.id),
          buttons: [],
          pressedActions: new Map(),
          stick: undefined,
          direction: undefined,
          repeater: createDirectionRepeater(),
          directionBlocked: false,
          heldButton: undefined
        }
        states.set(gamepad.index, state)
      }

      const { device } = state
      const pressed = gamepad.buttons.map((button) => button.pressed)

      // Released even while unfocused, so nothing stays pressed for whoever listens.
      for (const index of state.pressedActions.keys()) {
        if (!pressed[index]) releaseButton(state, index)
      }
      if (state.heldButton && !pressed[state.heldButton.index]) state.heldButton = undefined
      if (focused) {
        for (const index of getNewlyPressedButtons(state.buttons, pressed)) {
          const action = isDpadButton(index) ? undefined : getGamepadButtonAction(index)
          if (!action) continue
          emit(action, device)
          state.pressedActions.set(index, action)
          state.heldButton = { index, action, nextAt: time + REPEAT_DELAY_MS }
        }
        if (state.heldButton && time >= state.heldButton.nextAt) {
          emit(state.heldButton.action, device, 'repeat')
          state.heldButton.nextAt = time + REPEAT_INTERVAL_MS
        }
      }
      state.buttons = pressed

      state.stick = getStickDirection(gamepad.axes[0] ?? 0, gamepad.axes[1] ?? 0, state.stick)
      const held = getDpadDirection(pressed) ?? state.stick
      if (!held) state.directionBlocked = false
      else if (!focused) state.directionBlocked = true

      const effective = state.directionBlocked ? undefined : held
      const repeated = effective === state.direction
      state.direction = effective
      const direction = state.repeater.update(effective, time)
      if (direction && repeated) emit(direction, device, 'repeat')
      else if (direction) emit(direction, device)
    }

    // Forget disconnected gamepads, so a reconnected one starts from a clean state; the
    // buttons they held count as released.
    for (const [index, state] of states) {
      if (present.has(index)) continue
      for (const button of [...state.pressedActions.keys()]) releaseButton(state, button)
      states.delete(index)
    }

    frame = requestAnimationFrame(poll)
  }

  let frame = requestAnimationFrame(poll)
  return () => cancelAnimationFrame(frame)
}
