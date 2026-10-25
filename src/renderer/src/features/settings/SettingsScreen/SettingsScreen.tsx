import { useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useOutlet } from 'react-router'

import { useInputAction } from '@renderer/core/input'
import {
  ADD_EMULATOR_PATH,
  ADD_GAME_FOLDER_PATH,
  isSectionRoot,
  useGroupFocus,
  useRememberedState
} from '@renderer/core/navigation'
import { SAMPLE_ASSOCIATED_PLATFORMS } from '@renderer/mocks/associatedPlatforms'
import { SAMPLE_EMULATORS } from '@renderer/mocks/emulators'
import { SAMPLE_GAME_FOLDERS } from '@renderer/mocks/gameFolders'

import { EmulatorSettings } from './components/EmulatorSettings'
import { GameFolderSettings } from './components/GameFolderSettings'
import { PlatformSettings } from './components/PlatformSettings'
import { SettingsNav } from './components/SettingsNav'
import { SETTINGS_CATEGORIES, SETTINGS_NAV_GROUP_ID } from './SettingsScreen.constants'
import type { SettingsCategoryId } from './SettingsScreen.types'
import styles from './SettingsScreen.module.css'

/**
 * Settings: a narrow list of categories and, beside it, the content of the one in focus.
 * Screens inside Settings (e.g. adding an emulator) replace only that content, keeping the
 * categories on screen. Back returns from a category's content to the list.
 */
export function SettingsScreen(): React.JSX.Element {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  // The screen inside Settings being shown, if any.
  const outlet = useOutlet()
  const [categoryId, setCategoryId] = useRememberedState<SettingsCategoryId>(
    'category',
    SETTINGS_CATEGORIES[0].id
  )
  const focusCategories = useGroupFocus(SETTINGS_NAV_GROUP_ID)
  const panelRef = useRef<HTMLDivElement>(null)
  const idPrefix = useId()
  const panelId = `${idPrefix}-panel`
  const getTabId = (id: SettingsCategoryId): string => `${idPrefix}-${id}-tab`

  // Inside a screen of Settings, back returns to the category's content instead (see App).
  useInputAction((action) => {
    if (
      action === 'back' &&
      isSectionRoot(pathname) &&
      panelRef.current?.contains(document.activeElement)
    ) {
      focusCategories()
    }
  })

  return (
    <div className={styles.screen}>
      <h1 className={styles.heading}>{t('navigation.settings')}</h1>
      <div className={styles.columns}>
        <SettingsNav
          selectedId={categoryId}
          panelId={panelId}
          getTabId={getTabId}
          onSelect={setCategoryId}
        />
        <div
          ref={panelRef}
          id={panelId}
          role="tabpanel"
          aria-labelledby={getTabId(categoryId)}
          className={styles.panel}
        >
          {outlet ?? (
            <>
              {categoryId === 'emulators' && (
                <EmulatorSettings
                  emulators={SAMPLE_EMULATORS}
                  onAdd={() => navigate(ADD_EMULATOR_PATH)}
                />
              )}
              {categoryId === 'platforms' && (
                <PlatformSettings
                  platforms={SAMPLE_ASSOCIATED_PLATFORMS}
                  // Focusing the category selects it, which shows the emulators.
                  onSetUpEmulator={() => focusCategories('emulators')}
                />
              )}
              {categoryId === 'gameFolders' && (
                <GameFolderSettings
                  folders={SAMPLE_GAME_FOLDERS}
                  hasInstalledPlatforms={SAMPLE_ASSOCIATED_PLATFORMS.length > 0}
                  onSetUpEmulator={() => focusCategories('emulators')}
                  onAdd={() => navigate(ADD_GAME_FOLDER_PATH)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
