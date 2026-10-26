import { useCallback, useContext } from 'react'

import { NavigationContext } from './NavigationContext'

/**
 * A function that moves focus into the group `groupId`: to the item whose id it is given, or
 * else to the item focused there last (or its first one), e.g. back to a list after leaving
 * it for the content it opened.
 */
export function useGroupFocus(groupId: string): (itemId?: string) => void {
  const navigation = useContext(NavigationContext)

  return useCallback(
    (itemId?: string) => navigation?.focusGroup(groupId, itemId),
    [navigation, groupId]
  )
}
