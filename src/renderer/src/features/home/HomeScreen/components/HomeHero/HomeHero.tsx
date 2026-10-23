import { Clock, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'

import type { HomeHeroProps } from './HomeHero.types'
import { formatPlaytime, formatTimeSince } from './HomeHero.utils'
import styles from './HomeHero.module.css'

export function HomeHero({ game }: HomeHeroProps): React.JSX.Element {
  const { t, i18n } = useTranslation('home')

  return (
    <section className={styles.hero}>
      <img className={styles.artwork} src={game.imageUrl} alt="" />
      <div className={styles.content}>
        <span className={styles.platform}>{game.platform}</span>
        <p className={styles.resume}>
          <Play className={styles.resumeIcon} aria-hidden />
          {t('hero.resume')}
        </p>
        <h1 className={styles.title}>{game.title}</h1>
        <p className={styles.description}>{game.description}</p>
        <ul className={styles.meta}>
          <li className={styles.metaItem}>
            <Clock className={styles.metaIcon} aria-hidden />
            {t('hero.lastPlayed', {
              time: formatTimeSince(game.lastPlayedAt, new Date(), i18n.language)
            })}
          </li>
          <li className={styles.metaItem}>
            <Clock className={styles.metaIcon} aria-hidden />
            {t('hero.playtime', { duration: formatPlaytime(game.playtimeMinutes, t) })}
          </li>
        </ul>
        <div className={styles.continue}>
          <Button focused>{t('hero.continue')}</Button>
        </div>
      </div>
    </section>
  )
}
