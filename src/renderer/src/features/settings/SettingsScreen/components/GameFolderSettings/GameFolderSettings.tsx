import { Folder } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { FocusGroup } from '@renderer/core/navigation'

import { SettingsEmptyState } from '../../../components/SettingsEmptyState'
import { GameFolderListItem } from './components/GameFolderListItem'
import type { GameFolderSettingsProps } from './GameFolderSettings.types'
import styles from './GameFolderSettings.module.css'

/**
 * The folders Ilnamiki finds games in, each with its platform and how many games it has, and
 * the action to add one. With no folders, it says how to get the first
 * one: by setting up an emulator while no core is installed, else with Add folder; until it
 * is known whether any core is, it shows nothing, so neither view flashes. It has no heading
 * of its own: the selected category already names it.
 */
export function GameFolderSettings({
  folders,
  hasInstalledPlatforms,
  onSetUpEmulator,
  onAdd
}: GameFolderSettingsProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  // Only the empty view without cores leaves it out: it offers to set up an emulator instead.
  const canAddFolder = folders.length > 0 || hasInstalledPlatforms === true

  return (
    <FocusGroup id="settings-game-folders" className={styles.content}>
      {folders.length > 0 && (
        <ul className={styles.list}>
          {folders.map((folder) => (
            <li key={folder.id}>
              <GameFolderListItem folder={folder} />
            </li>
          ))}
        </ul>
      )}
      {folders.length === 0 && hasInstalledPlatforms === false && (
        <SettingsEmptyState
          icon={Folder}
          title={t('gameFolders.empty.title')}
          description={t('gameFolders.empty.noCores')}
          action={
            <Button focusId="set-up-emulator" onPress={onSetUpEmulator}>
              {t('gameFolders.empty.setUpEmulator')}
            </Button>
          }
        />
      )}
      {folders.length === 0 && hasInstalledPlatforms === true && (
        <SettingsEmptyState
          icon={Folder}
          title={t('gameFolders.empty.title')}
          description={t('gameFolders.empty.noFolders')}
        />
      )}
      {canAddFolder && (
        <div className={styles.actions}>
          <Button focusId="add" onPress={onAdd}>
            {t('gameFolders.add')}
          </Button>
        </div>
      )}
    </FocusGroup>
  )
}
