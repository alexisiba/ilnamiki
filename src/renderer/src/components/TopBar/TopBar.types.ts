import type { InputAction } from '@renderer/core/input'

export interface TopBarTabProps {
  label: string
  path: string
  /** Whether the current screen belongs to this section. */
  active: boolean
}

export interface ShoulderHintProps {
  action: InputAction
  onPress: () => void
}
