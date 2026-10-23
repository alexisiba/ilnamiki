import { Clock, History } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { formatPlaytime, formatTimeSince } from '@renderer/utils/time'

import type { GamePanelProps } from './GamePanel.types'
import styles from './GamePanel.module.css'

/** The selected game's description, play stats and Play now, which holds focus. */
export function GamePanel({ game, describedBy }: GamePanelProps): React.JSX.Element {
  const { t } = useTranslation('games')
  const { t: tCommon, i18n } = useTranslation()

  const stats = [
    {
      id: 'playtime',
      Icon: Clock,
      label: t('consoleGames.playtime'),
      value: formatPlaytime(game.playtimeMinutes, tCommon)
    },
    {
      id: 'last-played',
      Icon: History,
      label: t('consoleGames.lastPlayed'),
      value: formatTimeSince(game.lastPlayedAt, new Date(), i18n.language)
    }
  ]

  return (
    <div className={styles.panel}>
      <p className={styles.description}>{game.description}</p>
      <ul className={styles.stats}>
        {stats.map(({ id, Icon, label, value }) => (
          <li key={id} className={styles.stat}>
            <span className={styles.statLabel}>
              <Icon className={styles.icon} aria-hidden />
              {label}
            </span>
            <span className={styles.statValue}>{value}</span>
          </li>
        ))}
      </ul>
      <div className={styles.play}>
        <Button focusId="play-now" autoFocus aria-describedby={describedBy}>
          {t('consoleGames.playNow')}
        </Button>
      </div>
    </div>
  )
}
