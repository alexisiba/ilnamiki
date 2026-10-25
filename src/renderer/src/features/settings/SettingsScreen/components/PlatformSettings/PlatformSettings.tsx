import { Joystick } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { FocusGroup } from '@renderer/core/navigation'

import { SettingsEmptyState } from '../../../components/SettingsEmptyState'
import { PlatformListItem } from './components/PlatformListItem'
import type { PlatformSettingsProps } from './PlatformSettings.types'
import styles from './PlatformSettings.module.css'

/**
 * The platforms with an installed core, each one turned on or off, or, when there are none,
 * how to get one: by setting up an emulator. Sample data for now. It has no heading of its
 * own: the selected category already names it.
 */
export function PlatformSettings({
  platforms,
  onSetUpEmulator
}: PlatformSettingsProps): React.JSX.Element {
  const { t } = useTranslation('settings')

  return (
    <FocusGroup id="settings-platforms" className={styles.content}>
      {platforms.length === 0 ? (
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
      ) : (
        <ul className={styles.list}>
          {platforms.map((platform) => (
            <li key={platform.id}>
              <PlatformListItem platform={platform} />
            </li>
          ))}
        </ul>
      )}
    </FocusGroup>
  )
}
