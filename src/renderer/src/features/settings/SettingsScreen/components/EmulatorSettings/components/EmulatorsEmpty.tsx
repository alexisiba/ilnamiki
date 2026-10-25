import { Gamepad2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import styles from '../EmulatorSettings.module.css'

/** Shown instead of the list when no emulator is configured: says so and how to add one. */
export function EmulatorsEmpty(): React.JSX.Element {
  const { t } = useTranslation('settings')

  return (
    <section className={styles.empty}>
      <Gamepad2 className={styles.emptyIcon} aria-hidden />
      <h2 className={styles.title}>{t('emulators.empty.title')}</h2>
      <p className={styles.emptyDescription}>{t('emulators.empty.description')}</p>
    </section>
  )
}
