import { useNavigate } from 'react-router'

import { SECTION_PATHS } from './sections'

/** Location state that asks Settings to open on one of its categories. */
interface SettingsRequestState {
  settingsCategory: string
}

/**
 * The Settings category a location's `state` asks for (e.g. "emulators"), or null when it
 * asks for none. Settings checks it is one of its categories.
 */
export function getRequestedSettingsCategory(state: unknown): string | null {
  if (typeof state !== 'object' || state === null) return null
  const { settingsCategory } = state as Partial<SettingsRequestState>
  return typeof settingsCategory === 'string' ? settingsCategory : null
}

/**
 * A function that switches to Settings on the category `category` (e.g. "emulators"),
 * whichever category it was left on. It switches sections as their tabs do, without
 * stacking history.
 */
export function useOpenSettings(): (category: string) => void {
  const navigate = useNavigate()

  return (category) => {
    const state: SettingsRequestState = { settingsCategory: category }
    navigate(SECTION_PATHS.settings, { replace: true, state })
  }
}
