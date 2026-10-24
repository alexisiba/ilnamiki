import { useContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react'

import { NavigationContext, ScopeContext } from './NavigationContext'

/**
 * Like `useState`, but kept per screen while the app runs: leaving the screen (e.g. to another
 * section) and coming back shows it as it was left. `id` is unique within the screen.
 */
export function useRememberedState<T>(
  id: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const navigation = useContext(NavigationContext)
  const scope = useContext(ScopeContext)
  const key = `${scope}/${id}`
  const [value, setValue] = useState(() => {
    const remembered = navigation?.recall(key)
    return remembered === undefined ? initialValue : (remembered as T)
  })

  useEffect(() => {
    navigation?.remember(key, value)
  }, [navigation, key, value])

  return [value, setValue]
}
