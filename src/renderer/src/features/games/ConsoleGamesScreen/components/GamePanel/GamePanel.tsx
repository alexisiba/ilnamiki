import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'

import type { GamePanelProps } from './GamePanel.types'
import styles from './GamePanel.module.css'

/**
 * The selected game's description (saying there is none when it has none yet) and Play now,
 * which holds focus.
 */
export function GamePanel({ game, describedBy }: GamePanelProps): React.JSX.Element {
  const { t } = useTranslation('games')

  return (
    <div className={styles.panel}>
      {game.description ? (
        <p className={styles.description}>{game.description}</p>
      ) : (
        <p className={styles.noDescription}>{t('consoleGames.noDescription')}</p>
      )}
      <div className={styles.play}>
        <Button focusId="play-now" autoFocus aria-describedby={describedBy}>
          {t('consoleGames.playNow')}
        </Button>
      </div>
    </div>
  )
}
