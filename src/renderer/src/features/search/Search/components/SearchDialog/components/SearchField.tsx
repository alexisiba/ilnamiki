import { Search as SearchIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import styles from '../SearchDialog.module.css'

/** The search text, typed straight onto the blurred screen without a box around it. */
export function SearchField(): React.JSX.Element {
  const { t } = useTranslation('search')

  return (
    <div className={styles.field}>
      <SearchIcon className={styles.icon} aria-hidden />
      <input
        type="search"
        className={styles.input}
        aria-label={t('field')}
        placeholder={t('placeholder')}
      />
    </div>
  )
}
