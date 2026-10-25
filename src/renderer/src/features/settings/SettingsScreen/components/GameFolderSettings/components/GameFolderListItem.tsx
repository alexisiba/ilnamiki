import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { useFocusable } from '@renderer/core/navigation'

import type { GameFolderListItemProps } from '../GameFolderSettings.types'
import styles from '../GameFolderSettings.module.css'

/** A game folder: its platform, then how many games were found in it. */
export function GameFolderListItem({ folder }: GameFolderListItemProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { ref } = useFocusable<HTMLButtonElement>({ id: folder.id })
  const platformId = useId()
  const countId = useId()

  return (
    <button
      ref={ref}
      type="button"
      className={styles.item}
      aria-labelledby={platformId}
      aria-describedby={countId}
    >
      <span id={platformId} className={styles.platform}>
        {folder.platform}
      </span>
      <span id={countId} className={styles.count}>
        {t('gameFolders.games', { count: folder.gameCount })}
      </span>
    </button>
  )
}
