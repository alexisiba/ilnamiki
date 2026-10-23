import type { InputAction } from '@renderer/core/input'

export interface ButtonHintProps {
  action: InputAction
  /** What the action does in the current context, e.g. "Confirm" or "Search". */
  label?: string
}
