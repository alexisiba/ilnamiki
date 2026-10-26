import { Play } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { PlatformPill } from '@renderer/components/PlatformPill'
import { PlayStats } from '@renderer/components/PlayStats'
import { usePlayGame } from '@renderer/core/play'
import { playProblemMessageKey } from '@renderer/utils/playProblems'

import { HeroLayout } from '../HeroLayout'
import type { ContinueHeroProps } from './ContinueHero.types'
import styles from './ContinueHero.module.css'

/**
 * Home's hero once a game was played: the last played game, ready to continue. Continue
 * playing starts it and reads Playing, unavailable, until its emulator closes; when the game
 * can't start, why shows below it.
 */
export function ContinueHero({ game }: ContinueHeroProps): React.JSX.Element {
  const { t } = useTranslation('home')
  const { playing, problem, play } = usePlayGame(game.id)
  const problemId = useId()

  return (
    <HeroLayout
      id="home-hero"
      imageUrl={game.imageUrl}
      badge={<PlatformPill platform={game.platform} />}
      eyebrowIcon={Play}
      eyebrow={t('hero.resume')}
      title={game.title}
      description={game.description}
      details={
        <PlayStats lastPlayedAt={game.lastPlayedAt} playtimeMinutes={game.playtimeMinutes} />
      }
      actions={
        <Button
          focusId="continue"
          autoFocus
          aria-describedby={problem ? problemId : undefined}
          aria-disabled={playing}
          onPress={play}
        >
          {playing ? t('play.playing', { ns: 'common' }) : t('hero.continue')}
        </Button>
      }
      message={
        problem && (
          <p id={problemId} role="alert" className={styles.problem}>
            {t(playProblemMessageKey(problem), { ns: 'common' })}
          </p>
        )
      }
    />
  )
}
