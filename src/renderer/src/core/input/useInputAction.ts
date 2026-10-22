import { useEffect, useEffectEvent } from 'react'

import { KEYBOARD_BINDINGS, type InputAction } from './input'

/** Calls `onAction` with the semantic action of every mapped input while mounted. */
export function useInputAction(onAction: (action: InputAction) => void): void {
  const handleAction = useEffectEvent(onAction)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const action = KEYBOARD_BINDINGS[event.key]
      if (!action) return

      event.preventDefault()
      handleAction(action)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
