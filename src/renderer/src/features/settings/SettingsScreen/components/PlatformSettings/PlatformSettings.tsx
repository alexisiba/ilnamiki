import { Joystick, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { usePlatforms } from '@renderer/core/ipc'
import { FocusGroup } from '@renderer/core/navigation'

import { SettingsEmptyState } from '../../../components/SettingsEmptyState'
import { SETTINGS_PANEL_GROUP_ID } from '../../SettingsScreen.constants'
import { PlatformListItem } from './components/PlatformListItem'
import type { PlatformSettingsProps } from './PlatformSettings.types'
import styles from './PlatformSettings.module.css'

/**
 * The platforms the emulators' installed cores play, each one opening its details, or, when
 * there are none, how to get one: by setting up an emulator. Until they are read nothing
 * shows, so the empty view never flashes; when they can't be read, it says so. It has no
 * heading of its own: the selected category already names it.
 */
export function PlatformSettings({
  onSetUpEmulator,
  onOpen
}: PlatformSettingsProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { status, platforms } = usePlatforms()

  return (
    <FocusGroup id={SETTINGS_PANEL_GROUP_ID} contained className={styles.content}>
      {/* The list stays when a later read fails; only an empty one gives way to the error. */}
      {platforms.length > 0 && (
        <ul className={styles.list}>
          {platforms.map((platform) => (
            <li key={platform.id}>
              <PlatformListItem platform={platform} onOpen={() => onOpen(platform.id)} />
            </li>
          ))}
        </ul>
      )}
      {platforms.length === 0 && status === 'ready' && (
        <SettingsEmptyState
          icon={Joystick}
          title={t('platforms.empty.title')}
          description={t('platforms.empty.description')}
          action={
            <Button focusId="set-up-emulator" onPress={onSetUpEmulator}>
              {t('platforms.empty.setUpEmulator')}
            </Button>
          }
        />
      )}
      {platforms.length === 0 && status === 'failed' && (
        <SettingsEmptyState
          icon={TriangleAlert}
          title={t('platforms.failed.title')}
          description={t('platforms.failed.description')}
        />
      )}
    </FocusGroup>
  )
}
