import { Gamepad2, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { useEmulators } from '@renderer/core/ipc'
import { FocusGroup } from '@renderer/core/navigation'

import { SettingsEmptyState } from '../../../components/SettingsEmptyState'
import { EmulatorListItem } from './components/EmulatorListItem'
import type { EmulatorSettingsProps } from './EmulatorSettings.types'
import styles from './EmulatorSettings.module.css'

/**
 * The emulators the user added, or how to add one when there are none, with the action to
 * add one. Until they are read only the action shows, so the empty view never flashes;
 * when they can't be read, it says so. As a category's main content it has no Back button
 * (back returns to the categories) and no heading of its own (the category names it).
 */
export function EmulatorSettings({ onAdd, onOpen }: EmulatorSettingsProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { status, emulators } = useEmulators()

  return (
    <FocusGroup id="settings-emulators" className={styles.content}>
      {/* The list stays when a later read fails; only an empty one gives way to the error. */}
      {emulators.length > 0 && (
        <ul className={styles.list}>
          {emulators.map((emulator) => (
            <li key={emulator.id}>
              <EmulatorListItem emulator={emulator} onOpen={() => onOpen(emulator.id)} />
            </li>
          ))}
        </ul>
      )}
      {emulators.length === 0 && status === 'ready' && (
        <SettingsEmptyState
          icon={Gamepad2}
          title={t('emulators.empty.title')}
          description={t('emulators.empty.description')}
        />
      )}
      {emulators.length === 0 && status === 'failed' && (
        <SettingsEmptyState
          icon={TriangleAlert}
          title={t('emulators.failed.title')}
          description={t('emulators.failed.description')}
        />
      )}
      <div className={styles.actions}>
        <Button focusId="add" onPress={onAdd}>
          {t('emulators.add')}
        </Button>
      </div>
    </FocusGroup>
  )
}
