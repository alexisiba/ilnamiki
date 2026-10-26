/** Categories in the order the settings list shows them. */
export const SETTINGS_CATEGORIES = [
  { id: 'emulators', labelKey: 'categories.emulators' },
  { id: 'platforms', labelKey: 'categories.platforms' },
  { id: 'gameFolders', labelKey: 'categories.gameFolders' }
] as const

/** Focus group of the categories list, so focus can return to it. */
export const SETTINGS_NAV_GROUP_ID = 'settings-categories'

/** Focus group of the selected category's content, entered on confirm. */
export const SETTINGS_PANEL_GROUP_ID = 'settings-panel'
