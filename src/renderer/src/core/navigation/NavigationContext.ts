import { createContext } from 'react'

import type { Navigation } from './navigation'

export const NavigationContext = createContext<Navigation | null>(null)

/** Id of the focus group the subtree belongs to, if any. */
export const FocusGroupContext = createContext<string | undefined>(undefined)
