import { Folder, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { useGameFolders, usePlatforms } from '@renderer/core/ipc'
import { FocusGroup } from '@renderer/core/navigation'

import { SettingsEmptyState } from '../../../components/SettingsEmptyState'
import { SETTINGS_PANEL_GROUP_ID } from '../../SettingsScreen.constants'
import { GameFolderListItem } from './components/GameFolderListItem'
import type { GameFolderSettingsProps } from './GameFolderSettings.types'
import styles from './GameFolderSettings.module.css'

/**
 * The folders Ilnamiki finds games in, each with its platform and how many games it has and
 * opening its details, and the action to add one. With no folders, it says how to get the first one: by setting up an
 * emulator while no core is installed, else with Add folder. Until the folders and platforms
 * are read it shows nothing, so neither view flashes; when the folders can't be read, it says
 * so. It has no heading of its own: the selected category already names it.
 */
export function GameFolderSettings({
  onSetUpEmulator,
  onAdd,
  onOpen
}: GameFolderSettingsProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { status, folders } = useGameFolders()
  const platforms = usePlatforms()
  const known = status !== 'loading' && platforms.status !== 'loading'
  const hasInstalledPlatforms = platforms.platforms.length > 0
  // Only the empty view without cores leaves it out: it offers to set up an emulator instead.
  const canAddFolder = folders.length > 0 || (known && hasInstalledPlatforms)

  // A platform whose core was uninstalled keeps its folder, named by its id.
  const platformNameOf = (platformId: string): string =>
    platforms.platforms.find(({ id }) => id === platformId)?.name ?? platformId

  return (
    <FocusGroup id={SETTINGS_PANEL_GROUP_ID} contained className={styles.content}>
      {/* The list stays when a later read fails; only an empty one gives way to the error. */}
      {folders.length > 0 && (
        <ul className={styles.list}>
          {folders.map((folder) => (
            <li key={folder.id}>
              <GameFolderListItem
                folder={folder}
                platformName={platformNameOf(folder.platformId)}
                onOpen={() => onOpen(folder.id)}
              />
            </li>
          ))}
        </ul>
      )}
      {folders.length === 0 && status === 'failed' && (
        <SettingsEmptyState
          icon={TriangleAlert}
          title={t('gameFolders.failed.title')}
          description={t('gameFolders.failed.description')}
        />
      )}
      {folders.length === 0 && status === 'ready' && known && !hasInstalledPlatforms && (
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
      {folders.length === 0 && status === 'ready' && known && hasInstalledPlatforms && (
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
