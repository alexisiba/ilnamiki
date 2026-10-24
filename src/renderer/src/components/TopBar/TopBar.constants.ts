import { SECTION_PATHS } from '@renderer/core/navigation'

export const TOP_BAR_TABS = [
  { id: 'home', labelKey: 'navigation.home', path: SECTION_PATHS.home },
  { id: 'library', labelKey: 'navigation.library', path: SECTION_PATHS.library },
  { id: 'settings', labelKey: 'navigation.settings', path: SECTION_PATHS.settings }
] as const
