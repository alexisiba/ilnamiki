import { getSectionPath } from './sections'

/** A screen to return to, as it was left: its path and its history state. */
export interface BackTarget {
  pathname: string
  state: unknown
}

/** History state of a screen opened with `useOpenScreen`. */
export interface OpenedScreenState {
  /** The screen that opened it. */
  backTo: BackTarget
}

function isBackTarget(value: unknown): value is BackTarget {
  return (
    typeof value === 'object' &&
    value !== null &&
    'pathname' in value &&
    typeof value.pathname === 'string'
  )
}

/**
 * Where back returns to from the screen at `pathname` with history `state`: the screen that
 * opened it, or, when that isn't known (e.g. a screen a section tab restored), its section's
 * root.
 */
export function getBackTarget(pathname: string, state: unknown): BackTarget {
  const backTo =
    typeof state === 'object' && state !== null && 'backTo' in state ? state.backTo : undefined
  if (isBackTarget(backTo)) return { pathname: backTo.pathname, state: backTo.state ?? null }
  return { pathname: getSectionPath(pathname), state: null }
}

/** One step back inside a screen, e.g. from a form's second step to its first. */
interface BackStep {
  run: () => void
}

/** Steps back of the screens mounted, newest last. */
const backSteps: BackStep[] = []

/** Adds a step back, which back takes until the returned function removes it. */
export function addBackStep(step: BackStep): () => void {
  backSteps.push(step)
  return () => {
    backSteps.splice(backSteps.indexOf(step), 1)
  }
}

/** Takes the newest step back, if any: whether there was one. */
export function takeBackStep(): boolean {
  const step = backSteps.at(-1)
  if (!step) return false
  step.run()
  return true
}
