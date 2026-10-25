import { useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useOutlet } from 'react-router'

import { useInputAction } from '@renderer/core/input'
import { usePlatforms } from '@renderer/core/ipc'
import {
  ADD_EMULATOR_PATH,
  ADD_GAME_FOLDER_PATH,
  getEmulatorDetailsPath,
  isSectionRoot,
  useGroupFocus,
  useOpenScreen,
  useRememberedState
} from '@renderer/core/navigation'

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
  const openScreen = useOpenScreen()
  // The screen inside Settings being shown, if any.
  const outlet = useOutlet()
  const [categoryId, setCategoryId] = useRememberedState<SettingsCategoryId>(
    'category',
    SETTINGS_CATEGORIES[0].id
  )
  const focusCategories = useGroupFocus(SETTINGS_NAV_GROUP_ID)
  const platforms = usePlatforms()
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
                  onAdd={() => openScreen(ADD_EMULATOR_PATH)}
                  onOpen={(emulatorId) => openScreen(getEmulatorDetailsPath(emulatorId))}
                />
              )}
              {categoryId === 'platforms' && (
                <PlatformSettings
                  // Focusing the category selects it, which shows the emulators.
                  onSetUpEmulator={() => focusCategories('emulators')}
                />
              )}
              {categoryId === 'gameFolders' && (
                <GameFolderSettings
                  // No game folders can be saved yet, so there are none.
                  folders={[]}
                  // Not known until the platforms are first read.
                  hasInstalledPlatforms={
                    platforms.status === 'loading' ? null : platforms.platforms.length > 0
                  }
                  onSetUpEmulator={() => focusCategories('emulators')}
                  onAdd={() => openScreen(ADD_GAME_FOLDER_PATH)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
