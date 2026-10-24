import { useContext } from 'react'

import { NavigationContext } from './NavigationContext'

/**
 * Id of the item last focused in the group `groupId`, read while rendering. Lets a group that
 * shows its focused item (e.g. a carousel) start on the item focus is about to return to,
 * instead of moving there once focus is restored. It does not update when focus moves.
 */
export function useLastFocusedId(groupId: string): string | undefined {
  return useContext(NavigationContext)?.lastFocusedIn(groupId)
}
