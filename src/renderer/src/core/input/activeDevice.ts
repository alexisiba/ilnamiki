import type { InputDevice } from './input'
import { subscribeToInput } from './inputBus'

/**
 * The device assumed until the first input arrives. The keyboard, because browsers hide
 * gamepads until one of their buttons is pressed, so a gamepad can't be detected at launch.
 */
export const DEFAULT_INPUT_DEVICE: InputDevice = 'keyboard'

let activeDevice: InputDevice = DEFAULT_INPUT_DEVICE
const listeners = new Set<() => void>()
let stopFollowingInput: (() => void) | undefined

/** The last device that produced an action. The mouse never changes it. */
export function getActiveInputDevice(): InputDevice {
  return activeDevice
}

export function setActiveInputDevice(device: InputDevice): void {
  if (device === activeDevice) return
  activeDevice = device
  for (const listener of [...listeners]) listener()
}

/**
 * Calls `listener` whenever the active device changes. The device follows the input bus only
 * while there is at least one listener. Returns the unsubscribe function.
 */
export function subscribeToActiveInputDevice(listener: () => void): () => void {
  if (listeners.size === 0) {
    stopFollowingInput = subscribeToInput((_action, device) => setActiveInputDevice(device))
  }
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
    if (listeners.size > 0) return
    stopFollowingInput?.()
    stopFollowingInput = undefined
  }
}
