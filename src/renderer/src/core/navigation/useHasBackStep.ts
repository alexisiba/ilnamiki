import { useSyncExternalStore } from 'react'

import { hasBackStep, subscribeToBackSteps } from './backNavigation'

/** Whether back has a step to take inside the current screen (see `useBackStep`). */
export function useHasBackStep(): boolean {
  return useSyncExternalStore(subscribeToBackSteps, hasBackStep)
}
