import { useLayoutEffect, useState } from 'react'

import { playUiSound } from '@renderer/core/audio'
import { useInputAction, type Direction, type InputAction } from '@renderer/core/input'

import { createNavigation } from '../navigation'
import { NavigationContext, ScopeContext } from '../NavigationContext'
import type { NavigationProviderProps } from './NavigationProvider.types'

const isDirection = (action: InputAction): action is Direction =>
  action === 'up' || action === 'down' || action === 'left' || action === 'right'

/** Owns the app's focus: moves it with directions and clicks the focused item on confirm. */
export function NavigationProvider({
  scope = '',
  restoreFocus = true,
  children
}: NavigationProviderProps): React.JSX.Element {
  const [navigation] = useState(createNavigation)

  // A layout effect runs before the new screen's items register in their passive effects.
  useLayoutEffect(() => navigation.setScope(scope, restoreFocus), [navigation, scope, restoreFocus])

  useInputAction((action, phase) => {
    if (isDirection(action)) {
      // Held against an edge, only the press says so, not every repeat.
      if (navigation.move(action)) playUiSound('move')
      else if (phase === 'press') playUiSound('cant-move')
    }
    if (action === 'confirm') navigation.confirm()
  })

  return (
    <NavigationContext value={navigation}>
      <ScopeContext value={scope}>{children}</ScopeContext>
    </NavigationContext>
  )
}
