import { useEffect, useEffectEvent } from 'react'

import type { InputAction } from './input'
import { subscribeToInput } from './inputBus'

export interface UseInputActionOptions {
  /**
   * While mounted, only this handler receives actions, e.g. a dialog over the screen: the
   * screen behind neither moves focus nor goes back. The newest exclusive handler wins.
   */
  exclusive?: boolean
}

/** Exclusive handlers currently mounted, newest last. */
const exclusiveHandlers: symbol[] = []

/** Calls `onAction` with the semantic action of every mapped input while mounted. */
export function useInputAction(
  onAction: (action: InputAction) => void,
  { exclusive = false }: UseInputActionOptions = {}
): void {
  const handleAction = useEffectEvent(onAction)

  useEffect(() => {
    const handler = Symbol('input handler')
    if (exclusive) exclusiveHandlers.push(handler)

    const unsubscribe = subscribeToInput((action) => {
      const owner = exclusiveHandlers.at(-1)
      if (owner === undefined || owner === handler) handleAction(action)
    })

    return () => {
      unsubscribe()
      if (exclusive) exclusiveHandlers.splice(exclusiveHandlers.indexOf(handler), 1)
    }
  }, [exclusive])
}
