import { Keyboard } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { SettingsFormHeaderProps } from '../SettingsForm.types'
import styles from '../SettingsForm.module.css'

/**
 * The form's title, with a note that it is filled with a keyboard and mouse: settings forms
 * have no on-screen keyboard.
 */
export function SettingsFormHeader({ title }: SettingsFormHeaderProps): React.JSX.Element {
  const { t } = useTranslation('settings')

  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.note}>
        <Keyboard className={styles.noteIcon} aria-hidden />
        {t('form.keyboardNote')}
      </p>
    </div>
  )
}
