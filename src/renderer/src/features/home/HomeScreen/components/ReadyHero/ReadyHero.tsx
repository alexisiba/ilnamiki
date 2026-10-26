import { Gamepad2, Joystick, Sparkles } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import consolesArtwork from '@renderer/assets/images/consoles/consoles.webp'
import { Button } from '@renderer/components/Button'
import { SECTION_PATHS } from '@renderer/core/navigation'
import { usePlayRandomGame } from '@renderer/core/play'
import { playProblemMessageKey } from '@renderer/utils/playProblems'

import { HeroLayout } from '../HeroLayout'
import type { ReadyHeroProps } from './ReadyHero.types'
import styles from './ReadyHero.module.css'

/**
 * Home's hero while no game was played yet: how many games are ready, what plays them
 * (information, not controls), and the actions: exploring the library, focused, and Surprise
 * me, which starts a game of the library picked at random and reads Playing, unavailable,
 * until its emulator closes; when no game can start, why shows below it.
 */
export function ReadyHero({
  gameCount,
  emulatorCount,
  platformCount
}: ReadyHeroProps): React.JSX.Element {
  const { t } = useTranslation('home')
  const navigate = useNavigate()
  const { playing, problem, play } = usePlayRandomGame()
  const problemId = useId()

  return (
    <HeroLayout
      id="home-hero"
      imageUrl={consolesArtwork}
      eyebrowIcon={Sparkles}
      eyebrowIconStyle="outline"
      eyebrow={t('readyHero.ready')}
      title={t('readyHero.title', { count: gameCount })}
      description={t('readyHero.description')}
      details={
        <ul className={styles.counts}>
          <li className={styles.count}>
            <Gamepad2 className={styles.icon} aria-hidden />
            {t('readyHero.emulators', { count: emulatorCount })}
          </li>
          <li className={styles.count}>
            <Joystick className={styles.icon} aria-hidden />
            {t('readyHero.consoles', { count: platformCount })}
          </li>
        </ul>
      }
      actions={
        <>
          {/* Switches sections as their tabs do, without stacking history. */}
          <Button
            focusId="explore"
            autoFocus
            onPress={() => navigate(SECTION_PATHS.library, { replace: true })}
          >
            {t('readyHero.explore')}
          </Button>
          <Button
            focusId="surprise"
            aria-describedby={problem ? problemId : undefined}
            aria-disabled={playing}
            onPress={play}
          >
            {playing ? t('play.playing', { ns: 'common' }) : t('readyHero.surprise')}
          </Button>
        </>
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
