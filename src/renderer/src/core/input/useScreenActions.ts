import { useContext, useEffect, useState } from 'react'

import { InputScopeContext } from './inputScope'
import {
  addActionLayer,
  getActionSetting,
  getDecidingLayer,
  updateActionLayer,
  type ActionLayer,
  type ScreenActions
} from './screenActions'
import { useInputAction } from './useInputAction'

const DEFAULT_PRIORITY = 0
const SCREEN_PRIORITY = 1

/**
 * Declares, while mounted, what the actions do in its input scope: turned off with `false`,
 * and contextual ones bound to a handler and a label for the button guide. A binding runs on
 * its action's press only while this declaration decides it.
 */
function useActionLayer(actions: ScreenActions, priority: number): void {
  const scope = useContext(InputScopeContext)
  const [layer] = useState<ActionLayer>(() => ({ scope, priority, actions }))

  useEffect(() => addActionLayer(layer), [layer])

  // Every render, so bindings always call the latest handlers.
  useEffect(() => updateActionLayer(layer, actions))

  useInputAction((action) => {
    if (getDecidingLayer(action, scope) !== layer) return
    const setting = getActionSetting(action, scope)
    if (setting) setting.onPress()
  })
}

/**
 * The actions of the current screen, over the app's defaults: e.g. `{ tertiary: { label,
 * onPress } }` gives Y a meaning of its own here and `{ prevSection: false }` turns LB off.
 * Fixed actions can only be turned off; actions left out keep their default.
 */
export function useScreenActions(actions: ScreenActions): void {
  useActionLayer(actions, SCREEN_PRIORITY)
}

/** The app's default actions, used on every screen that doesn't change them. */
export function useDefaultActions(actions: ScreenActions): void {
  useActionLayer(actions, DEFAULT_PRIORITY)
}
