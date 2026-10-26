import type { SettingsCategory, SettingsCategoryId } from '../../SettingsScreen.types'

export interface SettingsNavProps {
  selectedId: SettingsCategoryId
  /** Id of the panel showing the selected category's content. */
  panelId: string
  getTabId: (id: SettingsCategoryId) => string
  onSelect: (id: SettingsCategoryId) => void
  /** Moves focus into the selected category's content. */
  onEnter: () => void
}

export interface SettingsNavTabProps {
  category: SettingsCategory
  selected: boolean
  tabId: string
  panelId: string
  onSelect: () => void
  /** Moves focus into the content; the tab is already selected, since it has focus. */
  onEnter: () => void
}
