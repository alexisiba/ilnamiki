import { Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { PlatformPill } from '@renderer/components/PlatformPill'
import { PlayStats } from '@renderer/components/PlayStats'
import { FocusGroup } from '@renderer/core/navigation'

import type { HomeHeroProps } from './HomeHero.types'
import styles from './HomeHero.module.css'

export function HomeHero({ game }: HomeHeroProps): React.JSX.Element {
  const { t } = useTranslation('home')

  return (
    <FocusGroup id="home-hero" as="section" className={styles.hero}>
      <img className={styles.artwork} src={game.imageUrl} alt="" />
      <div className={styles.content}>
        <PlatformPill platform={game.platform} />
        <p className={styles.resume}>
          <Play className={styles.resumeIcon} aria-hidden />
          {t('hero.resume')}
        </p>
        <h1 className={styles.title}>{game.title}</h1>
        <p className={styles.description}>{game.description}</p>
        <div className={styles.stats}>
          <PlayStats lastPlayedAt={game.lastPlayedAt} playtimeMinutes={game.playtimeMinutes} />
        </div>
        <div className={styles.continue}>
          <Button focusId="continue" autoFocus>
            {t('hero.continue')}
          </Button>
        </div>
      </div>
    </FocusGroup>
  )
}
