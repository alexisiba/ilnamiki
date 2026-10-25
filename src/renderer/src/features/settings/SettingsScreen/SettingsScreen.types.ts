import type { SETTINGS_CATEGORIES } from './SettingsScreen.constants'

export type SettingsCategory = (typeof SETTINGS_CATEGORIES)[number]

export type SettingsCategoryId = SettingsCategory['id']
