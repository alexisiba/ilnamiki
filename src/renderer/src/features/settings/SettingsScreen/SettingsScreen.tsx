import { useTranslation } from 'react-i18next'

import styles from './SettingsScreen.module.css'

/** Placeholder until the settings screen is designed. */
export function SettingsScreen(): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>{t('navigation.settings')}</h1>
    </div>
  )
}
