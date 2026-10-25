import { FolderOpen } from 'lucide-react'

import { useFocusable } from '@renderer/core/navigation'

import type { BrowseButtonProps } from '../PathField.types'
import styles from '../PathField.module.css'

/** Icon button at the end of the path field that opens the system's picker. */
export function BrowseButton({ label, onPress }: BrowseButtonProps): React.JSX.Element {
  const { ref } = useFocusable<HTMLButtonElement>({ id: 'browse' })

  return (
    <button ref={ref} type="button" className={styles.browse} aria-label={label} onClick={onPress}>
      <FolderOpen className={styles.browseIcon} aria-hidden />
    </button>
  )
}
