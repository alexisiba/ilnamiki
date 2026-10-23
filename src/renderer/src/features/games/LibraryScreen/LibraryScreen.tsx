import { useTranslation } from 'react-i18next'

import styles from './LibraryScreen.module.css'

/** Placeholder until the library screen is designed. */
export function LibraryScreen(): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>{t('navigation.library')}</h1>
    </div>
  )
}
