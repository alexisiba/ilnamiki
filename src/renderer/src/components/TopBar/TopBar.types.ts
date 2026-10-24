import type { InputAction } from '@renderer/core/input'

export interface TopBarTabProps {
  label: string
  /** Where the tab leads: the screen its section was last left on. */
  path: string
  /** Whether the current screen belongs to this section. */
  active: boolean
}

export interface ShoulderHintProps {
  action: InputAction
  onPress: () => void
}
