import { Gamepad2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { FocusGroup } from '@renderer/core/navigation'

import { SettingsEmptyState } from '../SettingsEmptyState'
import { EmulatorListItem } from './components/EmulatorListItem'
import type { EmulatorSettingsProps } from './EmulatorSettings.types'
import styles from './EmulatorSettings.module.css'

/**
 * The configured emulators, or how to add one when there are none, with the action to add
 * one. As a category's main content it has no Back button (back returns to the categories)
 * and no heading of its own (the selected category already names it).
 */
export function EmulatorSettings({ emulators, onAdd }: EmulatorSettingsProps): React.JSX.Element {
  const { t } = useTranslation('settings')

  return (
    <FocusGroup id="settings-emulators" className={styles.content}>
      {emulators.length === 0 ? (
        <SettingsEmptyState
          icon={Gamepad2}
          title={t('emulators.empty.title')}
          description={t('emulators.empty.description')}
        />
      ) : (
        <ul className={styles.list}>
          {emulators.map((emulator) => (
            <li key={emulator.id}>
              <EmulatorListItem emulator={emulator} />
            </li>
          ))}
        </ul>
      )}
      <div className={styles.actions}>
        <Button focusId="add" onPress={onAdd}>
          {t('emulators.add')}
        </Button>
      </div>
    </FocusGroup>
  )
}
