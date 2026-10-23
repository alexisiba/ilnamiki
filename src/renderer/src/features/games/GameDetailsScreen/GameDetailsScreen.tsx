import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { Button } from '@renderer/components/Button'
import { PlatformPill } from '@renderer/components/PlatformPill'
import { PlayStats } from '@renderer/components/PlayStats'
import { FocusGroup } from '@renderer/core/navigation'
import { getSampleGame } from '@renderer/mocks/games'

import styles from './GameDetailsScreen.module.css'

/** A game's details, opened from its card, with Play focused. */
export function GameDetailsScreen(): React.JSX.Element {
  const { t } = useTranslation('games')
  const { gameId = '' } = useParams()
  const game = getSampleGame(gameId)

  if (!game) {
    return (
      <div className={styles.screen}>
        <p className={styles.notFound}>{t('details.notFound')}</p>
      </div>
    )
  }

  const facts = [game.releaseYear, game.genre, t('details.players', { count: game.players })]

  return (
    <FocusGroup id="game-details" as="section" className={styles.screen}>
      <img className={styles.artwork} src={game.imageUrl} alt="" />
      <div className={styles.content}>
        <PlatformPill platform={game.platform} />
        <h1 className={styles.title}>{game.title}</h1>
        <p className={styles.facts}>{facts.join(' · ')}</p>
        <p className={styles.description}>{game.description}</p>
        <div className={styles.stats}>
          <PlayStats lastPlayedAt={game.lastPlayedAt} playtimeMinutes={game.playtimeMinutes} />
        </div>
        <div className={styles.play}>
          <Button focusId="play" autoFocus>
            {t('details.play')}
          </Button>
        </div>
      </div>
    </FocusGroup>
  )
}
