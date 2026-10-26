import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useOutlet } from 'react-router'

import {
  ADD_EMULATOR_PATH,
  ADD_GAME_FOLDER_PATH,
  getEmulatorDetailsPath,
  getGameFolderDetailsPath,
  getRequestedSettingsCategory,
  useBackStep,
  useEnterGroup,
  useGroupFocus,
  useOpenScreen,
  useRememberedState
} from '@renderer/core/navigation'

import { EmulatorSettings } from './components/EmulatorSettings'
import { GameFolderSettings } from './components/GameFolderSettings'
import { PlatformSettings } from './components/PlatformSettings'
import { SettingsInnerScreen } from './components/SettingsInnerScreen'
import { SettingsNav } from './components/SettingsNav'
import {
  SETTINGS_CATEGORIES,
  SETTINGS_NAV_GROUP_ID,
  SETTINGS_PANEL_GROUP_ID
} from './SettingsScreen.constants'
import type { SettingsCategoryId } from './SettingsScreen.types'
import styles from './SettingsScreen.module.css'

/**
 * Settings: a narrow list of categories and, beside it, the content of the one in focus.
 * Directions stay in the list or in the content: confirming a category enters its content,
 * and back returns from it to the list. Screens inside Settings (e.g. adding an emulator)
 * take the whole width instead, so another category can't be reached until back leaves them.
 */
export function SettingsScreen(): React.JSX.Element {
  const { t } = useTranslation()
  const { state, key } = useLocation()
  const openScreen = useOpenScreen()
  // The screen inside Settings being shown, if any.
  const outlet = useOutlet()
  const [categoryId, setCategoryId] = useRememberedState<SettingsCategoryId>(
    'category',
    SETTINGS_CATEGORIES[0].id
  )
  const focusCategories = useGroupFocus(SETTINGS_NAV_GROUP_ID)
  const enterPanel = useEnterGroup(SETTINGS_PANEL_GROUP_ID)
  /** Whether focus is in the category's content, which back leaves for the categories. */
  const [inPanel, setInPanel] = useState(false)
  const requestedCategory = SETTINGS_CATEGORIES.find(
    ({ id }) => id === getRequestedSettingsCategory(state)
  )?.id
  const idPrefix = useId()
  const panelId = `${idPrefix}-panel`
  const getTabId = (id: SettingsCategoryId): string => `${idPrefix}-${id}-tab`

  // Opened on a category from another section (e.g. Home): focusing it selects it.
  useEffect(() => {
    if (requestedCategory) focusCategories(requestedCategory)
  }, [key, requestedCategory, focusCategories])

  // From a category's content, back returns to the categories: a step inside Settings. Inside
  // a screen of Settings, back leaves that screen instead.
  useBackStep(!outlet && inPanel ? () => focusCategories() : undefined)

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
            onSelect={(id) => {
              setCategoryId(id)
              setInPanel(false)
            }}
            onEnter={enterPanel}
          />
          <div
            id={panelId}
            role="tabpanel"
            aria-labelledby={getTabId(categoryId)}
            className={styles.panel}
            onFocus={() => setInPanel(true)}
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
