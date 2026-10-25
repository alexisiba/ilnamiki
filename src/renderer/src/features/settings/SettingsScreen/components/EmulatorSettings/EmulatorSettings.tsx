import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { FocusGroup } from '@renderer/core/navigation'
import { SAMPLE_EMULATORS } from '@renderer/mocks/emulators'

import { EmulatorListItem } from './components/EmulatorListItem'
import type { EmulatorSettingsProps } from './EmulatorSettings.types'
import styles from './EmulatorSettings.module.css'

/** The configured emulators, with the actions to leave and to add one. Sample data for now. */
export function EmulatorSettings({ onBack }: EmulatorSettingsProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const emulators = SAMPLE_EMULATORS

  return (
    <FocusGroup id="settings-emulators" className={styles.content}>
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
      <div className={styles.actions}>
        <Button focusId="back" onPress={onBack}>
          {t('emulators.back')}
        </Button>
        <Button focusId="add">{t('emulators.add')}</Button>
      </div>
    </FocusGroup>
  )
}
