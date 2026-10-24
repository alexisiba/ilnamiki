import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { OnScreenKeyboard } from '@renderer/components/OnScreenKeyboard'
import { useInputAction } from '@renderer/core/input'
import { NavigationProvider } from '@renderer/core/navigation'

import { SearchField } from './components/SearchField'
import { SearchGuide } from './components/SearchGuide'
import type { SearchDialogProps } from './SearchDialog.types'
import styles from './SearchDialog.module.css'

/**
 * Search over the current screen, which blurs behind it. It is modal: the screen behind is
 * inert, back closes it, and focus returns where it was. Closing unmounts it, so it always
 * opens empty.
 */
export function SearchDialog({ onClose }: SearchDialogProps): React.JSX.Element {
  const { t } = useTranslation('search')
  const ref = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const dialog = ref.current
    const previousFocus = document.activeElement
    dialog?.showModal()

    return () => {
      dialog?.close()
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true })
    }
  }, [])

  useInputAction((action) => {
    if (action === 'back') onClose()
  })

  return (
    <dialog ref={ref} className={styles.dialog} aria-label={t('dialog')}>
      {/* Its own navigation: directions move only between the field and the keys. */}
      <NavigationProvider scope="search">
        <SearchField value={query} onChange={setQuery} />
        <div className={styles.keyboard}>
          <OnScreenKeyboard
            value={query}
            onChange={setQuery}
            // Searching runs here once there are results to show.
            onSubmit={() => {}}
            actionLabel={t('submit')}
          />
        </div>
      </NavigationProvider>
      <SearchGuide />
    </dialog>
  )
}
