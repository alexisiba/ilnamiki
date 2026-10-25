import { FolderOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useFocusable } from '@renderer/core/navigation'

import type { BrowseButtonProps } from '../EmulatorForm.types'
import styles from '../EmulatorForm.module.css'

/** Icon button at the end of the path field that opens the system's file picker. */
export function BrowseButton({ onPress }: BrowseButtonProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { ref } = useFocusable<HTMLButtonElement>({ id: 'browse' })

  return (
    <button
      ref={ref}
      type="button"
      className={styles.browse}
      aria-label={t('addEmulator.browse')}
      onClick={onPress}
    >
      <FolderOpen className={styles.browseIcon} aria-hidden />
    </button>
  )
}
