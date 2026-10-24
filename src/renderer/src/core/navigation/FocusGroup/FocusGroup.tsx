import { useContext, useLayoutEffect, useRef } from 'react'

import { FocusGroupContext, NavigationContext } from '../NavigationContext'
import type { FocusGroupProps } from './FocusGroup.types'

/**
 * Groups focusable items (a shelf, a panel). Directions move inside the group first; when
 * focus enters it from another group, it returns to the item that was focused last.
 */
export function FocusGroup({
  id,
  as: Container = 'div',
  scrollAlign = 'nearest',
  className,
  children
}: FocusGroupProps): React.JSX.Element {
  const navigation = useContext(NavigationContext)
  const ref = useRef<HTMLDivElement>(null)

  // Registers before its items (passive effects), so they can scroll within it from the start.
  useLayoutEffect(() => {
    const element = ref.current
    if (!navigation || !element) return
    return navigation.registerGroup({ id, element, scrollAlign })
  }, [navigation, id, scrollAlign])

  return (
    <FocusGroupContext value={id}>
      <Container ref={ref} className={className}>
        {children}
      </Container>
    </FocusGroupContext>
  )
}
