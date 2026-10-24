import type { HintAction } from '@renderer/core/input'

export interface ButtonHintProps {
  action: HintAction
  /** What the action does in the current context, e.g. "Confirm" or "Search". */
  label?: string
}
