import { useContext, useEffect, useRef, type RefObject } from 'react'

import { FocusGroupContext, NavigationContext } from './NavigationContext'

export interface UseFocusableOptions {
  /** Unique within its focus group; lets focus be remembered and restored. */
  id: string
  /** Takes focus when the screen opens, unless focus is restored to another item. */
  autoFocus?: boolean
  /**
   * Whether pointing at the element focuses it. Turn it off where taking focus moves the
   * element away from the pointer (e.g. a carousel); pressing it focuses it instead.
   */
  focusOnHover?: boolean
}

export interface UseFocusable<T extends HTMLElement> {
  ref: RefObject<T | null>
}

/**
 * Makes the element reachable by spatial navigation and focusable with the pointer.
 * Confirming the focused element clicks it, so `onClick` handles every input device.
 */
export function useFocusable<T extends HTMLElement>({
  id,
  autoFocus = false,
  focusOnHover = true
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
    const pointerEvent = focusOnHover ? 'pointermove' : 'pointerdown'
    const handlePointer = (event: PointerEvent): void =>
      focusOnHover ? navigation.pointerMove(element, event) : navigation.pointerDown(element)
    element.addEventListener(pointerEvent, handlePointer)

    return () => {
      element.removeEventListener(pointerEvent, handlePointer)
      unregister()
    }
  }, [navigation, groupId, id, autoFocus, focusOnHover])

  return { ref }
}
