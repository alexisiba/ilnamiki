import { useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useOutlet } from 'react-router'

import { useInputAction } from '@renderer/core/input'
import {
  ADD_EMULATOR_PATH,
  ADD_GAME_FOLDER_PATH,
  getEmulatorDetailsPath,
  getGameFolderDetailsPath,
  getRequestedSettingsCategory,
  isSectionRoot,
  useGroupFocus,
  useOpenScreen,
  useRememberedState
} from '@renderer/core/navigation'

import { EmulatorSettings } from './components/EmulatorSettings'
import { GameFolderSettings } from './components/GameFolderSettings'
import { PlatformSettings } from './components/PlatformSettings'
import { SettingsInnerScreen } from './components/SettingsInnerScreen'
import { SettingsNav } from './components/SettingsNav'
import { SETTINGS_CATEGORIES, SETTINGS_NAV_GROUP_ID } from './SettingsScreen.constants'
import type { SettingsCategoryId } from './SettingsScreen.types'
import styles from './SettingsScreen.module.css'

/**
 * Settings: a narrow list of categories and, beside it, the content of the one in focus.
 * Screens inside Settings (e.g. adding an emulator) take the whole width instead, so another
 * category can't be reached until back leaves them. Back returns from a category's content
 * to the list.
 */
export function SettingsScreen(): React.JSX.Element {
  const { t } = useTranslation()
  const { pathname, state, key } = useLocation()
  const openScreen = useOpenScreen()
  // The screen inside Settings being shown, if any.
  const outlet = useOutlet()
  const [categoryId, setCategoryId] = useRememberedState<SettingsCategoryId>(
    'category',
    SETTINGS_CATEGORIES[0].id
  )
  const focusCategories = useGroupFocus(SETTINGS_NAV_GROUP_ID)
  const requestedCategory = SETTINGS_CATEGORIES.find(
    ({ id }) => id === getRequestedSettingsCategory(state)
  )?.id
  const panelRef = useRef<HTMLDivElement>(null)
  const idPrefix = useId()
  const panelId = `${idPrefix}-panel`
  const getTabId = (id: SettingsCategoryId): string => `${idPrefix}-${id}-tab`

  // Opened on a category from another section (e.g. Home): focusing it selects it.
  useEffect(() => {
    if (requestedCategory) focusCategories(requestedCategory)
  }, [key, requestedCategory, focusCategories])

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
      {outlet ? (
        <SettingsInnerScreen categoryId={categoryId}>{outlet}</SettingsInnerScreen>
      ) : (
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
                onSetUpEmulator={() => focusCategories('emulators')}
                onAdd={() => openScreen(ADD_GAME_FOLDER_PATH)}
                onOpen={(folderId) => openScreen(getGameFolderDetailsPath(folderId))}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
