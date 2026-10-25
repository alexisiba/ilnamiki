import type { SettingsCategory, SettingsCategoryId } from '../../SettingsScreen.types'

export interface SettingsNavProps {
  selectedId: SettingsCategoryId
  /** Id of the panel showing the selected category's content. */
  panelId: string
  getTabId: (id: SettingsCategoryId) => string
  onSelect: (id: SettingsCategoryId) => void
}

export interface SettingsNavTabProps {
  category: SettingsCategory
  selected: boolean
  tabId: string
  panelId: string
  onSelect: () => void
}
