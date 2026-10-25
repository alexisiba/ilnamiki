import { useSyncExternalStore } from 'react'

import { getEmulatorsState, subscribeToEmulators, type EmulatorsState } from './emulators'

/**
 * The emulators the user added, read from main when the first component using them mounts,
 * and again whenever one is added.
 */
export function useEmulators(): EmulatorsState {
  return useSyncExternalStore(subscribeToEmulators, getEmulatorsState)
}
