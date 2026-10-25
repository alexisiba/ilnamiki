import { useLocation, useNavigate } from 'react-router'

import type { OpenedScreenState } from './backNavigation'

/**
 * A function that opens the screen at `path`, remembering the current screen as it is, so
 * back returns to it (see `useGoBack`).
 */
export function useOpenScreen(): (path: string) => void {
  const { pathname, state } = useLocation()
  const navigate = useNavigate()

  return (path) => {
    const screenState: OpenedScreenState = { backTo: { pathname, state } }
    navigate(path, { state: screenState })
  }
}
