import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { usePlayGame } from '@renderer/core/play'
import { playProblemMessageKey } from '@renderer/utils/playProblems'

import type { GamePanelProps } from './GamePanel.types'
import styles from './GamePanel.module.css'

/**
 * The selected game's description (saying there is none when it has none yet) and Play now,
 * which holds focus. Play now starts the game in its emulator and reads Playing, unavailable,
 * until the emulator closes; when the game can't start, why shows below it.
 */
export function GamePanel({ game, describedBy }: GamePanelProps): React.JSX.Element {
  const { t } = useTranslation('games')
  const { playing, problem, play } = usePlayGame(game.id)
  const problemId = useId()

  return (
    <div className={styles.panel}>
      {game.description ? (
        <p className={styles.description}>{game.description}</p>
      ) : (
        <p className={styles.noDescription}>{t('consoleGames.noDescription')}</p>
      )}
      <div className={styles.play}>
        <Button
          focusId="play-now"
          autoFocus
          aria-describedby={problem ? `${describedBy} ${problemId}` : describedBy}
          aria-disabled={playing}
          onPress={play}
        >
          {playing ? t('play.playing', { ns: 'common' }) : t('consoleGames.playNow')}
        </Button>
      </div>
      {problem && (
        <p id={problemId} role="alert" className={styles.problem}>
          {t(playProblemMessageKey(problem), { ns: 'common' })}
        </p>
      )}
    </div>
  )
}
