import { useCallback, useContext } from 'react'

import { NavigationContext } from './NavigationContext'

/**
 * A function that moves focus to the first item of the group `groupId`, as when entering it
 * anew, e.g. into the content beside a list on confirm.
 */
export function useEnterGroup(groupId: string): () => void {
  const navigation = useContext(NavigationContext)

  return useCallback(() => navigation?.enterGroup(groupId), [navigation, groupId])
}
