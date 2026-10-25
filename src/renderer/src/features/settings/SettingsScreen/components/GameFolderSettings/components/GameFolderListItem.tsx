import { TriangleAlert } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { useFocusable } from '@renderer/core/navigation'

import type { GameFolderListItemProps } from '../GameFolderSettings.types'
import styles from '../GameFolderSettings.module.css'

/**
 * A game folder: its platform, then how many games were saved from it and, when the folder
 * is no longer there (moved, deleted or on a drive that is out), that it isn't available.
 * Confirming it opens its details.
 */
export function GameFolderListItem({
  folder,
  platformName,
  onOpen
}: GameFolderListItemProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { ref } = useFocusable<HTMLButtonElement>({ id: folder.id })
  const platformId = useId()
  const countId = useId()
  const unavailableId = useId()

  return (
    <button
      ref={ref}
      type="button"
      className={styles.item}
      aria-labelledby={platformId}
      aria-describedby={folder.isAvailable ? countId : `${countId} ${unavailableId}`}
      onClick={onOpen}
    >
      <span id={platformId} className={styles.platform}>
        {platformName}
      </span>
      <span id={countId} className={styles.count}>
        {t('gameFolders.games', { count: folder.gameCount })}
      </span>
      {!folder.isAvailable && (
        <span id={unavailableId} className={styles.unavailable}>
          <TriangleAlert className={styles.unavailableIcon} aria-hidden />
          {t('gameFolders.unavailable')}
        </span>
      )}
    </button>
  )
}
