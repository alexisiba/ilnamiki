import { useLayoutEffect, useState } from 'react'

import { useInputAction, type Direction, type InputAction } from '@renderer/core/input'

import { createNavigation } from '../navigation'
import { NavigationContext } from '../NavigationContext'
import type { NavigationProviderProps } from './NavigationProvider.types'

const isDirection = (action: InputAction): action is Direction =>
  action === 'up' || action === 'down' || action === 'left' || action === 'right'

/** Owns the app's focus: moves it with directions and clicks the focused item on confirm. */
export function NavigationProvider({
  scope = '',
  children
}: NavigationProviderProps): React.JSX.Element {
  const [navigation] = useState(createNavigation)

  // A layout effect runs before the new screen's items register in their passive effects.
  useLayoutEffect(() => navigation.setScope(scope), [navigation, scope])

  useInputAction((action) => {
    if (isDirection(action)) navigation.move(action)
    if (action === 'confirm') navigation.confirm()
  })

  return <NavigationContext value={navigation}>{children}</NavigationContext>
}
