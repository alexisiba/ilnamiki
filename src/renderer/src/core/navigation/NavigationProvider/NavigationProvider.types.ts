import type { ReactNode } from 'react'

export interface NavigationProviderProps {
  /** The current screen (e.g. the route path); focus is remembered and restored per scope. */
  scope?: string
  children: ReactNode
}
