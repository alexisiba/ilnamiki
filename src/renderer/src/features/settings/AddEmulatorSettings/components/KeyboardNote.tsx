import { Keyboard } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import styles from '../AddEmulatorSettings.module.css'

/** Tells the user this form is filled with a keyboard and mouse: it has no on-screen keyboard. */
export function KeyboardNote(): React.JSX.Element {
  const { t } = useTranslation('settings')

  return (
    <p className={styles.note}>
      <Keyboard className={styles.noteIcon} aria-hidden />
      {t('addEmulator.keyboardNote')}
    </p>
  )
}
