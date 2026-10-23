import { useSyncExternalStore } from 'react'

import { getActiveInputDevice, subscribeToActiveInputDevice } from './activeDevice'
import type { InputDevice } from './input'

/** The last-used input device, used to pick button hints. Updates as soon as it changes. */
export function useActiveInputDevice(): InputDevice {
  return useSyncExternalStore(subscribeToActiveInputDevice, getActiveInputDevice)
}
