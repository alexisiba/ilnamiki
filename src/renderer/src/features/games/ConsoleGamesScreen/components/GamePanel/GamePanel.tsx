import { EllipsisVertical } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import noScreenshot from '@renderer/assets/images/games/no-bg-image.webp'
import { Button } from '@renderer/components/Button'
import { ButtonHint } from '@renderer/components/ButtonHint'
import { GameOptions } from '@renderer/components/GameOptions'
import { playUiSound } from '@renderer/core/audio'
import { useScreenActions } from '@renderer/core/input'
import { usePlayGame } from '@renderer/core/play'
import { playProblemMessageKey } from '@renderer/utils/playProblems'

import type { GamePanelProps } from './GamePanel.types'
import styles from './GamePanel.module.css'

/**
 * The selected game's column: its screenshot behind it all (a generic image until games have
 * metadata), and over it a card with its description (saying there is none when it has none
 * yet), Play now, which holds focus, and beside it a button that opens the game's options, as
 * the secondary action does. Play now starts the game in its emulator and reads
 * Playing, unavailable, until the emulator closes; when the game can't start, why shows below
 * it.
 */
export function GamePanel({ game, describedBy }: GamePanelProps): React.JSX.Element {
  const { t } = useTranslation('games')
  const { playing, problem, play } = usePlayGame(game.id)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const problemId = useId()

  useScreenActions({
    secondary: {
      label: t('buttonGuide.options', { ns: 'common' }),
      onPress: () => setOptionsOpen(true)
    }
  })

  return (
    <div className={styles.column}>
      <img className={styles.screenshot} src={noScreenshot} alt="" />
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
          {/*
           * For the pointer only: directions can't reach it, as left and right switch games
           * here; the gamepad and the keyboard open the options with the secondary action,
           * whose button it shows after its icon.
           */}
          <button
            type="button"
            tabIndex={-1}
            className={styles.more}
            aria-label={t('gameOptions.open', { ns: 'common' })}
            onClick={() => {
              playUiSound('select')
              setOptionsOpen(true)
            }}
          >
            <span className={styles.moreContent} aria-hidden>
              <EllipsisVertical className={styles.moreIcon} />
              <ButtonHint action="secondary" />
            </span>
          </button>
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
    </div>
  )
}
