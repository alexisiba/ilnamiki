import { useContext, useSyncExternalStore } from 'react'

import type { InputAction } from './input'
import { InputScopeContext } from './inputScope'
import { getActionLayersVersion, isActionEnabled, subscribeToActionLayers } from './screenActions'

/**
 * Whether `action` is on in the current screen (see `useScreenActions`), e.g. to hide its hint
 * or its on-screen button. Updates as soon as it changes.
 */
export function useActionEnabled(action: InputAction): boolean {
  const scope = useContext(InputScopeContext)
  useSyncExternalStore(subscribeToActionLayers, getActionLayersVersion)
  return isActionEnabled(action, scope)
}
