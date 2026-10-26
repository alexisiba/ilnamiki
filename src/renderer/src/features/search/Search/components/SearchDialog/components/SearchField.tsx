import { Search as SearchIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useFocusable } from '@renderer/core/navigation'

import type { SearchFieldProps } from '../SearchDialog.types'
import styles from '../SearchDialog.module.css'

/**
 * The search text, typed straight onto the blurred screen without a box around it, from a
 * physical keyboard or the on-screen one. It is focused when search opens.
 */
export function SearchField({ value, onChange, onActivate }: SearchFieldProps): React.JSX.Element {
  const { t } = useTranslation('search')
  const { ref } = useFocusable<HTMLInputElement>({ id: 'field', autoFocus: true })

  return (
    <div className={styles.field}>
      <SearchIcon className={styles.icon} aria-hidden />
      <input
        ref={ref}
        type="search"
        className={styles.input}
        aria-label={t('field')}
        placeholder={t('placeholder')}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        // Confirm clicks the focused field too.
        onClick={onActivate}
      />
    </div>
  )
}
