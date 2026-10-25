import { useSyncExternalStore } from 'react'

import { getPlatformsState, subscribeToPlatforms, type PlatformsState } from './platforms'

/**
 * The platforms the user's emulators play, read from main when the first component using them
 * mounts, and again whenever an emulator is added, changed or removed.
 */
export function usePlatforms(): PlatformsState {
  return useSyncExternalStore(subscribeToPlatforms, getPlatformsState)
}
