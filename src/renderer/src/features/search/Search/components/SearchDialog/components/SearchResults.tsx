import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { GameCarousel } from '@renderer/components/GameCarousel'

import type { SearchResultsProps } from '../SearchDialog.types'
import styles from '../SearchDialog.module.css'

/**
 * The games found, in a carousel that takes focus as soon as it shows, or a message when
 * nothing matches. Confirming a game opens it.
 */
export function SearchResults({ query, results, onOpen }: SearchResultsProps): React.JSX.Element {
  const { t } = useTranslation('search')
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <section className={styles.results} aria-label={t('results')}>
      {results.length > 0 ? (
        <GameCarousel
          games={results}
          selectedIndex={selectedIndex}
          focusGroupId="search-results"
          focusOnShow
          onSelect={setSelectedIndex}
          onOpen={onOpen}
        />
      ) : (
        <p className={styles.noResults} role="status">
          {t('noResults', { query: query.trim() })}
        </p>
      )}
    </section>
  )
}
