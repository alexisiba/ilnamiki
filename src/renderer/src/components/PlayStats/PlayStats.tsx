import { Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { formatPlaytime, formatTimeSince } from '@renderer/utils/time'

import styles from './PlayStats.module.css'

export interface PlayStatsProps {
  lastPlayedAt: Date
  playtimeMinutes: number
}

/** When a game was last played and its total playtime. */
export function PlayStats({ lastPlayedAt, playtimeMinutes }: PlayStatsProps): React.JSX.Element {
  const { t, i18n } = useTranslation()

  return (
    <ul className={styles.stats}>
      <li className={styles.stat}>
        <Clock className={styles.icon} aria-hidden />
        {t('playStats.lastPlayed', {
          time: formatTimeSince(lastPlayedAt, new Date(), i18n.language)
        })}
      </li>
      <li className={styles.stat}>
        <Clock className={styles.icon} aria-hidden />
        {t('playStats.playtime', { duration: formatPlaytime(playtimeMinutes, t) })}
      </li>
    </ul>
  )
}
