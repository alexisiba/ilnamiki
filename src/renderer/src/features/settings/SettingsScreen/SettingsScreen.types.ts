import type { ReactNode } from 'react'

import type { SETTINGS_CATEGORIES } from './SettingsScreen.constants'

export type SettingsCategory = (typeof SETTINGS_CATEGORIES)[number]

export type SettingsCategoryId = SettingsCategory['id']

export interface SettingsInnerScreenProps {
  /** The category the screen was opened from, named in the trail. */
  categoryId: SettingsCategoryId
  children: ReactNode
}
