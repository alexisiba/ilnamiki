import { useCallback, useContext } from 'react'

import { NavigationContext } from './NavigationContext'

/**
 * A function that moves focus into the group `groupId`, to the item focused there last (or
 * its first one), e.g. back to a list after leaving it for the content it opened.
 */
export function useGroupFocus(groupId: string): () => void {
  const navigation = useContext(NavigationContext)

  return useCallback(() => navigation?.focusGroup(groupId), [navigation, groupId])
}
