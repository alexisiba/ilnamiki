import { startGamepadPolling } from './gamepadPoller'
import type { InputAction, InputDevice } from './input'
import { startKeyboardInput } from './keyboardInput'

export type InputListener = (action: InputAction, device: InputDevice) => void

const listeners = new Set<InputListener>()
let stopSources: (() => void) | undefined

/** Sends `action`, produced by `device`, to every subscriber. */
export function emitInput(action: InputAction, device: InputDevice): void {
  // A copy, so listeners that unsubscribe while handling the action don't skip others.
  for (const listener of [...listeners]) listener(action, device)
}

/**
 * Calls `listener` with every semantic action from any input device. Device sources are
 * listened to only while there is at least one subscriber. Returns the unsubscribe function.
 */
export function subscribeToInput(listener: InputListener): () => void {
  if (listeners.size === 0) {
    const stopKeyboard = startKeyboardInput(emitInput)
    const stopGamepads = startGamepadPolling(emitInput)
    stopSources = () => {
      stopKeyboard()
      stopGamepads()
    }
  }
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
    if (listeners.size > 0) return
    stopSources?.()
    stopSources = undefined
  }
}
