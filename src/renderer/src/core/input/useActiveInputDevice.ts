import type { InputDevice } from './input'

const DEFAULT_INPUT_DEVICE: InputDevice = 'xbox'

/**
 * The last-used input device, used to pick button hints.
 * Fixed to the default until device detection exists.
 */
export function useActiveInputDevice(): InputDevice {
  return DEFAULT_INPUT_DEVICE
}
