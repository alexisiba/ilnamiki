import type { InputAction } from '@renderer/core/input'

export interface TopBarTabProps {
  label: string
  path: string
}

export interface ShoulderHintProps {
  action: InputAction
  onPress: () => void
}
