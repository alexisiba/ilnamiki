import { createContext } from 'react'

/** The input scope a handler belongs to; `undefined` is the app's root scope. */
export const InputScopeContext = createContext<symbol | undefined>(undefined)

/** Input scopes currently open, newest last. */
export const openScopes: symbol[] = []

/** Whether handlers in `scope` receive input: only the newest open scope (or the root) does. */
export function isActiveScope(scope: symbol | undefined): boolean {
  return openScopes.at(-1) === scope
}
