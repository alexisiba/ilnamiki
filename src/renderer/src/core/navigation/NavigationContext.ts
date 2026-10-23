import { createContext } from 'react'

import type { Navigation } from './navigation'

export const NavigationContext = createContext<Navigation | null>(null)

/**
 * The current screen, as given to the provider. Read while rendering, it already names the
 * new screen, while the navigation only switches to it once the screen has rendered.
 */
export const ScopeContext = createContext('')

/** Id of the focus group the subtree belongs to, if any. */
export const FocusGroupContext = createContext<string | undefined>(undefined)
