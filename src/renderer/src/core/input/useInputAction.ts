import { useEffect, useEffectEvent } from 'react'

import type { InputAction } from './input'
import { subscribeToInput } from './inputBus'

/** Calls `onAction` with the semantic action of every mapped input while mounted. */
export function useInputAction(onAction: (action: InputAction) => void): void {
  const handleAction = useEffectEvent(onAction)

  useEffect(() => subscribeToInput((action) => handleAction(action)), [])
}
