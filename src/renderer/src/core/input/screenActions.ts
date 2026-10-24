import type { Direction, InputAction } from './input'

/** Actions that mean the same on every screen: a screen can only turn them off. */
export type FixedAction = Direction | 'confirm' | 'back' | 'prevSection' | 'nextSection' | 'menu'

/** Actions each screen gives a meaning of its own, labelled in the button guide. */
export type ContextualAction = 'secondary' | 'tertiary' | 'prevGroup' | 'nextGroup'

/** What a contextual action does on a screen. */
export interface ActionBinding {
  /** What it does, shown in the button guide, e.g. "Search". */
  label: string
  onPress: () => void
}

/**
 * The actions a screen changes: `false` turns one off, and a contextual one can get a binding
 * of its own. Actions left out keep their default.
 */
export type ScreenActions = { [A in FixedAction]?: false } & {
  [A in ContextualAction]?: ActionBinding | false
}

/** Contextual actions in the order the button guide shows them. */
export const CONTEXTUAL_ACTIONS: ContextualAction[] = [
  'secondary',
  'tertiary',
  'prevGroup',
  'nextGroup'
]

/** The actions declared by one component, e.g. a screen. */
export interface ActionLayer {
  /** The input scope it applies to; `undefined` is the app's root scope. */
  scope: symbol | undefined
  /** Higher priorities win: a screen's actions (1) over the app's defaults (0). */
  priority: number
  actions: ScreenActions
}

const layers: ActionLayer[] = []
const listeners = new Set<() => void>()
let version = 0

const notify = (): void => {
  version++
  for (const listener of [...listeners]) listener()
}

const settingOf = (layer: ActionLayer, action: InputAction): ActionBinding | false | undefined =>
  (layer.actions as Partial<Record<InputAction, ActionBinding | false>>)[action]

/** Adds `layer`, which decides its actions until the returned function removes it. */
export function addActionLayer(layer: ActionLayer): () => void {
  layers.push(layer)
  notify()

  return () => {
    layers.splice(layers.indexOf(layer), 1)
    notify()
  }
}

/**
 * Replaces the actions of `layer`. Subscribers hear of it only when what they show changes
 * (which actions are off and their labels), not when only the handlers are new.
 */
export function updateActionLayer(layer: ActionLayer, actions: ScreenActions): void {
  // Functions are left out of JSON, so handlers don't count as changes.
  const changed = JSON.stringify(layer.actions) !== JSON.stringify(actions)
  layer.actions = actions
  if (changed) notify()
}

/**
 * The layer that decides `action` in `scope`: of those that set it, the one with the highest
 * priority, and the newest among equals.
 */
export function getDecidingLayer(
  action: InputAction,
  scope: symbol | undefined
): ActionLayer | undefined {
  let deciding: ActionLayer | undefined
  for (const layer of layers) {
    if (layer.scope !== scope || settingOf(layer, action) === undefined) continue
    if (!deciding || layer.priority >= deciding.priority) deciding = layer
  }
  return deciding
}

/** What `action` does in `scope`: a binding, `false` when off, or `undefined` when unset. */
export function getActionSetting(
  action: InputAction,
  scope: symbol | undefined
): ActionBinding | false | undefined {
  const layer = getDecidingLayer(action, scope)
  return layer && settingOf(layer, action)
}

/** Whether `action` reaches its handlers in `scope`: every action does unless turned off. */
export function isActionEnabled(action: InputAction, scope: symbol | undefined): boolean {
  return getActionSetting(action, scope) !== false
}

/** Calls `listener` whenever the declared actions change. Returns the unsubscribe function. */
export function subscribeToActionLayers(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** A number that changes with every change of the declared actions. */
export function getActionLayersVersion(): number {
  return version
}
