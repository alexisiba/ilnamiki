import { Play } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { Button } from '@renderer/components/Button'
import { GameOptions } from '@renderer/components/GameOptions'
import { PlatformPill } from '@renderer/components/PlatformPill'
import { PlayStats } from '@renderer/components/PlayStats'
import { useScreenActions } from '@renderer/core/input'
import { useGameDetails, usePlatforms } from '@renderer/core/ipc'
import { FocusGroup } from '@renderer/core/navigation'
import { usePlayGame } from '@renderer/core/play'
import { backdropOf } from '@renderer/utils/gameArtwork'
import { getPlatformName } from '@renderer/utils/platformName'
import { playProblemMessageKey } from '@renderer/utils/playProblems'

import styles from './GameDetailsScreen.module.css'
import { gameFacts } from './GameDetailsScreen.utils'

const MINUTE_MS = 60 * 1000

/**
 * A game of the library, opened from its card, with Play now focused: its title and console,
 * the facts its metadata knows (year, genre, developer, players), and when it was last played
 * and for how long, saying so while it has no metadata, no description or was never played.
 * Its screenshot shows behind it (a generic image while it has none). Play now starts the game and reads Playing, unavailable, until its emulator
 * closes; when the game can't start, why shows below it. Options, beside it, opens the game's
 * options, as the secondary action does. Until the game is read nothing shows, so no message
 * flashes.
 */
export function GameDetailsScreen(): React.JSX.Element | null {
  const { t } = useTranslation('games')
  const { gameId = '' } = useParams()
  const details = useGameDetails(gameId)
  const platforms = usePlatforms()
  const { playing, problem, play } = usePlayGame(gameId)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const problemId = useId()

  // A shortcut to Options, while there is a game to set options for.
  useScreenActions(
    details.game
      ? {
          secondary: {
            label: t('buttonGuide.options', { ns: 'common' }),
            onPress: () => setOptionsOpen(true)
          }
        }
      : {}
  )

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

  const backdrop = backdropOf(game.artwork)
  const facts = gameFacts(game, (count) => t('details.players', { count }))

  return (
    <FocusGroup id="game-details" as="section" className={styles.screen}>
      <img
        className={backdrop.isPixelArt ? `${styles.artwork} ${styles.pixelArt}` : styles.artwork}
        src={backdrop.url}
        alt=""
      />
      <div className={styles.content}>
        <PlatformPill platform={getPlatformName(game.platformId, platforms.platforms)} />
        <h1 className={styles.title}>{game.title}</h1>
        <p className={styles.facts}>
          {facts.length > 0 ? facts.join(' · ') : t('details.noMetadata')}
        </p>
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
            <span className={styles.buttonContent}>
              {playing ? t('play.playing', { ns: 'common' }) : t('details.play')}
              <Play className={styles.playIcon} aria-hidden />
            </span>
          </Button>
          <Button focusId="options" onPress={() => setOptionsOpen(true)}>
            {t('details.options')}
          </Button>
        </div>
        {problem && (
          <p id={problemId} role="alert" className={styles.problem}>
            {t(playProblemMessageKey(problem), { ns: 'common' })}
          </p>
        )}
      </div>
      {optionsOpen && (
        <GameOptions gameId={game.id} title={game.title} onClose={() => setOptionsOpen(false)} />
      )}
    </FocusGroup>
  )
}
