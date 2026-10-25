/** Categories in the order the settings list shows them. */
export const SETTINGS_CATEGORIES = [
  { id: 'emulators', labelKey: 'categories.emulators' },
  { id: 'platforms', labelKey: 'categories.platforms' }
] as const

/** Focus group of the categories list, so focus can return to it. */
export const SETTINGS_NAV_GROUP_ID = 'settings-categories'
