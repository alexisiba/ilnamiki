import { useTranslation } from 'react-i18next'

import type { RecentGameCardProps } from '../../RecentlyPlayed.types'
import { formatLastPlayed } from '../../RecentlyPlayed.utils'
import styles from './RecentGameCard.module.css'

export function RecentGameCard({ game }: RecentGameCardProps): React.JSX.Element {
  const { i18n } = useTranslation()

  return (
    <article className={styles.card}>
      <img className={styles.artwork} src={game.imageUrl} alt="" />
      <span className={styles.platform}>{game.platform}</span>
      <div className={styles.info}>
        <h3 className={styles.title}>{game.title}</h3>
        <p className={styles.lastPlayed}>
          {formatLastPlayed(game.lastPlayedAt, new Date(), i18n.language)}
        </p>
      </div>
    </article>
  )
}
