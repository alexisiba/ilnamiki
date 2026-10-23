import { useTranslation } from 'react-i18next'

import { RecentGameCard } from './components/RecentGameCard'
import type { RecentlyPlayedProps } from './RecentlyPlayed.types'
import styles from './RecentlyPlayed.module.css'

export function RecentlyPlayed({ games }: RecentlyPlayedProps): React.JSX.Element {
  const { t } = useTranslation('home')

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t('recentlyPlayed.title')}</h2>
      <ul className={styles.rail}>
        {games.map((game) => (
          <li key={game.id}>
            <RecentGameCard game={game} />
          </li>
        ))}
      </ul>
    </section>
  )
}
