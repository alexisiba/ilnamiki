import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { OnScreenKeyboard } from '@renderer/components/OnScreenKeyboard'
import { useInputAction } from '@renderer/core/input'

import { SearchField } from './components/SearchField'
import type { SearchDialogProps } from './SearchDialog.types'
import styles from './SearchDialog.module.css'

/**
 * Search over the current screen, which blurs behind it. It is modal: the screen behind is
 * inert and gets no input, back closes it, and focus returns where it was.
 */
export function SearchDialog({ onClose }: SearchDialogProps): React.JSX.Element {
  const { t } = useTranslation('search')
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    const previousFocus = document.activeElement
    // Also focuses its first control: the field.
    dialog?.showModal()

    return () => {
      dialog?.close()
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true })
    }
  }, [])

  useInputAction(
    (action) => {
      if (action === 'back') onClose()
    },
    { exclusive: true }
  )

  return (
    <dialog ref={ref} className={styles.dialog} aria-label={t('dialog')}>
      <SearchField />
      <div className={styles.keyboard}>
        <OnScreenKeyboard actionLabel={t('submit')} />
      </div>
    </dialog>
  )
}
