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
  label: string
  onPress: () => void
}
