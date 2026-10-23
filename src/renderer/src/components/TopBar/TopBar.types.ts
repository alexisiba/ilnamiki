import type { InputAction } from '@renderer/core/input'

import type { TOP_BAR_TABS } from './TopBar.constants'

export type TopBarTabId = (typeof TOP_BAR_TABS)[number]['id']

export interface TopBarProps {
  defaultTab: TopBarTabId
}

export interface TopBarTabProps {
  label: string
  active: boolean
  onSelect: () => void
}

export interface ShoulderHintProps {
  action: InputAction
  onPress: () => void
}
