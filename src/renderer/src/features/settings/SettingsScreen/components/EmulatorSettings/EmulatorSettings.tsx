import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { FocusGroup } from '@renderer/core/navigation'

import { EmulatorListItem } from './components/EmulatorListItem'
import { EmulatorsEmpty } from './components/EmulatorsEmpty'
import type { EmulatorSettingsProps } from './EmulatorSettings.types'
import styles from './EmulatorSettings.module.css'

/** The configured emulators, or how to add one when there are none, with the actions. */
export function EmulatorSettings({
  emulators,
  onBack,
  onAdd
}: EmulatorSettingsProps): React.JSX.Element {
  const { t } = useTranslation('settings')

  return (
    <FocusGroup id="settings-emulators" className={styles.content}>
      {emulators.length === 0 ? (
        <EmulatorsEmpty />
      ) : (
        <section className={styles.configured}>
          <h2 className={styles.title}>{t('emulators.configured')}</h2>
          <ul className={styles.list}>
            {emulators.map((emulator) => (
              <li key={emulator.id}>
                <EmulatorListItem emulator={emulator} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className={styles.actions}>
        <Button focusId="back" onPress={onBack}>
          {t('emulators.back')}
        </Button>
        <Button focusId="add" onPress={onAdd}>
          {t('emulators.add')}
        </Button>
      </div>
    </FocusGroup>
  )
}
