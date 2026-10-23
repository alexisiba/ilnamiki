import { startGamepadPolling } from './gamepadPoller'
import { getKeyboardAction, type InputAction, type InputDevice } from './input'

export type InputListener = (action: InputAction, device: InputDevice) => void

const listeners = new Set<InputListener>()
let stopGamepadPolling: (() => void) | undefined

/** Sends `action`, produced by `device`, to every subscriber. */
export function emitInput(action: InputAction, device: InputDevice): void {
  // A copy, so listeners that unsubscribe while handling the action don't skip others.
  for (const listener of [...listeners]) listener(action, device)
}

function handleKeyDown(event: KeyboardEvent): void {
  const action = getKeyboardAction(event.key)
  if (!action) return

  event.preventDefault()
  emitInput(action, 'keyboard')
}

/**
 * Calls `listener` with every semantic action from any input device. Device sources are
 * listened to only while there is at least one subscriber. Returns the unsubscribe function.
 */
export function subscribeToInput(listener: InputListener): () => void {
  if (listeners.size === 0) {
    window.addEventListener('keydown', handleKeyDown)
    stopGamepadPolling = startGamepadPolling(emitInput)
  }
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
    if (listeners.size > 0) return
    window.removeEventListener('keydown', handleKeyDown)
    stopGamepadPolling?.()
    stopGamepadPolling = undefined
  }
}
