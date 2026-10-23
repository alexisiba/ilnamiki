import { useSyncExternalStore } from 'react'

import { isGamepadConnected, subscribeToGamepadConnection } from './gamepadConnection'

/** Whether at least one gamepad is connected. Updates as gamepads connect and disconnect. */
export function useGamepadConnected(): boolean {
  return useSyncExternalStore(subscribeToGamepadConnection, isGamepadConnected)
}
