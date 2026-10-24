import { useContext, useSyncExternalStore } from 'react'

import { InputScopeContext } from './inputScope'
import {
  CONTEXTUAL_ACTIONS,
  getActionLayersVersion,
  getActionSetting,
  subscribeToActionLayers,
  type ContextualAction
} from './screenActions'

/**
 * The contextual actions bound in the current screen (see `useScreenActions`) with their
 * labels, in the order the button guide shows them. Updates as soon as they change.
 */
export function useContextualActions(): { action: ContextualAction; label: string }[] {
  const scope = useContext(InputScopeContext)
  useSyncExternalStore(subscribeToActionLayers, getActionLayersVersion)

  return CONTEXTUAL_ACTIONS.flatMap((action) => {
    const setting = getActionSetting(action, scope)
    return setting ? [{ action, label: setting.label }] : []
  })
}
