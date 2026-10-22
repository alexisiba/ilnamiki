import { useTranslation } from 'react-i18next'

import styles from '../TopBar.module.css'

export function TopBarBrand(): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className={styles.brand}>
      <span className={styles.brandName}>{t('appName')}</span>
      <span className={styles.brandDot} aria-hidden />
    </div>
  )
}
