import { useContext, useEffect, useRef, type RefObject } from 'react'

import { FocusGroupContext, NavigationContext } from './NavigationContext'

export interface UseFocusableOptions {
  /** Unique within its focus group; lets focus be remembered and restored. */
  id: string
  /** Takes focus when the screen opens, unless focus is restored to another item. */
  autoFocus?: boolean
}

export interface UseFocusable<T extends HTMLElement> {
  ref: RefObject<T | null>
}

/**
 * Makes the element reachable by spatial navigation and focusable by pointing at it.
 * Confirming the focused element clicks it, so `onClick` handles every input device.
 */
export function useFocusable<T extends HTMLElement>({
  id,
  autoFocus = false
}: UseFocusableOptions): UseFocusable<T> {
  const navigation = useContext(NavigationContext)
  const groupId = useContext(FocusGroupContext)
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!navigation || !element) return

    const unregister = navigation.registerItem({
      key: `${groupId ?? ''}/${id}`,
      groupId,
      element,
      autoFocus
    })
    const handlePointerMove = (event: PointerEvent): void => navigation.pointerMove(element, event)
    element.addEventListener('pointermove', handlePointerMove)

    return () => {
      element.removeEventListener('pointermove', handlePointerMove)
      unregister()
    }
  }, [navigation, groupId, id, autoFocus])

  return { ref }
}
