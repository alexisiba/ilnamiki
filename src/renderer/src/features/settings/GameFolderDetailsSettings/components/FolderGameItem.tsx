import { useFocusable } from '@renderer/core/navigation'

import type { FolderGameItemProps } from '../GameFolderDetailsSettings.types'
import styles from '../GameFolderDetailsSettings.module.css'

/**
 * A game saved from the folder, by its title. It takes focus so the list can be browsed with
 * the gamepad; confirming it does nothing yet.
 */
export function FolderGameItem({ game }: FolderGameItemProps): React.JSX.Element {
  const { ref } = useFocusable<HTMLButtonElement>({ id: game.id })

  return (
    <button ref={ref} type="button" className={styles.game}>
      {game.title}
    </button>
  )
}
