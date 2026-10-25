import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import type { ScannedGameProblem } from '@shared/api'

import { useFocusable } from '@renderer/core/navigation'

import type { ScannedGameItemProps } from '../FolderScanResults.types'
import styles from '../FolderScanResults.module.css'

/**
 * A game found: a dot (green when it can be played, red when it is damaged), its title and,
 * when damaged, why and what to do, which also describes it. It takes focus so the list can
 * be browsed with the gamepad; confirming it does nothing yet.
 */
export function ScannedGameItem({ game }: ScannedGameItemProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { ref } = useFocusable<HTMLButtonElement>({ id: game.relativePath })
  const titleId = useId()
  const hintId = useId()

  const hintOf = (problem: ScannedGameProblem): string => {
    if (problem.kind === 'empty-index') return t('folderScan.emptyIndex')
    return t('folderScan.missingFiles', {
      count: problem.files.length,
      files: problem.files.join(', ')
    })
  }

  return (
    <button
      ref={ref}
      type="button"
      className={styles.game}
      aria-labelledby={titleId}
      aria-describedby={game.problem ? hintId : undefined}
    >
      <span id={titleId} className={styles.gameTitle}>
        <span className={game.problem ? styles.damagedDot : styles.playableDot} aria-hidden />
        {game.title}
      </span>
      {game.problem && (
        <span id={hintId} className={styles.hint}>
          {hintOf(game.problem)}
        </span>
      )}
    </button>
  )
}
