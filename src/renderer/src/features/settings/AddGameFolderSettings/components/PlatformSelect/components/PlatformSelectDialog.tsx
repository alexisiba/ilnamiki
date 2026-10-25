import { useLayoutEffect, useRef } from 'react'

import { useInputAction } from '@renderer/core/input'
import { FocusGroup, NavigationProvider } from '@renderer/core/navigation'

import type { PlatformSelectDialogProps } from '../PlatformSelect.types'
import styles from '../PlatformSelect.module.css'
import { PlatformSelectOption } from './PlatformSelectOption'

/**
 * The platforms to choose from, over the blurred screen. It is modal: the form behind is
 * inert, it opens on the chosen platform (or the first one), and back or a click outside the
 * list closes it without choosing. Focus returns to the select when it closes.
 */
export function PlatformSelectDialog({
  labelId,
  platforms,
  value,
  onSelect,
  onClose
}: PlatformSelectDialogProps): React.JSX.Element {
  const ref = useRef<HTMLDialogElement>(null)
  const hasSelection = platforms.some((platform) => platform.id === value)

  // Opening a modal dialog focuses its first button. A layout effect opens it before the
  // options register (in passive effects), so the chosen one can take focus after that.
  useLayoutEffect(() => {
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
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={labelId}
      // The dialog itself is only hit outside the list, on its backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      {/* Its own navigation: directions move only between the platforms. */}
      <NavigationProvider scope="platform-select">
        <FocusGroup id="platform-options" className={styles.sheet}>
          <ul className={styles.options}>
            {platforms.map((platform, index) => (
              <li key={platform.id}>
                <PlatformSelectOption
                  platform={platform}
                  selected={platform.id === value}
                  autoFocus={hasSelection ? platform.id === value : index === 0}
                  onSelect={() => onSelect(platform.id)}
                />
              </li>
            ))}
          </ul>
        </FocusGroup>
      </NavigationProvider>
    </dialog>
  )
}
