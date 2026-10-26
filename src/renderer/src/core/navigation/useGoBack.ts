import { useLocation, useNavigate } from 'react-router'

import { getBackTarget } from './backNavigation'

/**
 * A function that returns one level, to the screen that opened the current one as it was left
 * (or its section's root when that isn't known). It replaces the current entry instead of
 * stacking history.
 */
export function useGoBack(): () => void {
  const { pathname, state } = useLocation()
  const navigate = useNavigate()

  return () => {
    const target = getBackTarget(pathname, state)
    navigate(target.pathname, { replace: true, state: target.state })
  }
}
