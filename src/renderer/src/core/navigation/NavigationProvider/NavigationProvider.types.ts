import type { ReactNode } from 'react'

export interface NavigationProviderProps {
  /** The current screen (e.g. the route path); focus is remembered and restored per scope. */
  scope?: string
  /**
   * Whether focus returns to where it was left in the scope when it opens: true when coming
   * back to a screen, false when it is opened anew, which starts with its initial focus.
   */
  restoreFocus?: boolean
  children: ReactNode
}
