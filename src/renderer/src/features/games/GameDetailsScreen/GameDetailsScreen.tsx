import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import noScreenshot from '@renderer/assets/images/games/no-bg-image.webp'
import { Button } from '@renderer/components/Button'
import { PlatformPill } from '@renderer/components/PlatformPill'
import { PlayStats } from '@renderer/components/PlayStats'
import { useGameDetails, usePlatforms } from '@renderer/core/ipc'
import { FocusGroup } from '@renderer/core/navigation'
import { usePlayGame } from '@renderer/core/play'
import { getPlatformName } from '@renderer/utils/platformName'
import { playProblemMessageKey } from '@renderer/utils/playProblems'

import styles from './GameDetailsScreen.module.css'

const MINUTE_MS = 60 * 1000

/**
 * A game of the library, opened from its card, with Play focused: its title and console, and
 * when it was last played and for how long, saying so while it has no metadata, no description
 * or was never played (a generic screenshot shows behind it until games have metadata). Play starts the game and
 * reads Playing, unavailable, until its emulator closes; when the game can't start, why shows
 * below it. Until the game is read nothing shows, so no message flashes.
 */
export function GameDetailsScreen(): React.JSX.Element | null {
  const { t } = useTranslation('games')
  const { gameId = '' } = useParams()
  const details = useGameDetails(gameId)
  const platforms = usePlatforms()
  const { playing, problem, play } = usePlayGame(gameId)
  const problemId = useId()

  if (details.status === 'loading') return null

  const game = details.game
  if (!game) {
    return (
      <div className={styles.screen}>
        <p className={styles.notFound}>
          {details.status === 'failed' ? t('details.failed') : t('details.notFound')}
        </p>
      </div>
    )
  }

  return (
    <FocusGroup id="game-details" as="section" className={styles.screen}>
      <img className={styles.artwork} src={noScreenshot} alt="" />
      <div className={styles.content}>
        <PlatformPill platform={getPlatformName(game.platformId, platforms.platforms)} />
        <h1 className={styles.title}>{game.title}</h1>
        <p className={styles.facts}>{t('details.noMetadata')}</p>
        <p className={styles.description}>{t('details.noDescription')}</p>
        <div className={styles.stats}>
          {game.lastPlayedAt === null ? (
            <p className={styles.neverPlayed}>{t('details.neverPlayed')}</p>
          ) : (
            <PlayStats
              lastPlayedAt={new Date(game.lastPlayedAt)}
              playtimeMinutes={Math.round(game.playtimeMs / MINUTE_MS)}
            />
          )}
        </div>
        <div className={styles.play}>
          <Button
            focusId="play"
            autoFocus
            aria-describedby={problem ? problemId : undefined}
            aria-disabled={playing}
            onPress={play}
          >
            {playing ? t('play.playing', { ns: 'common' }) : t('details.play')}
          </Button>
        </div>
        {problem && (
          <p id={problemId} role="alert" className={styles.problem}>
            {t(playProblemMessageKey(problem), { ns: 'common' })}
          </p>
        )}
      </div>
    </FocusGroup>
  )
}
