import { useId, useLayoutEffect, useRef } from 'react'

import { Button } from '@renderer/components/Button'
import { playUiSound } from '@renderer/core/audio'
import { useInputAction } from '@renderer/core/input'
import { FocusGroup, NavigationProvider } from '@renderer/core/navigation'

import type { ConfirmDialogProps } from '../ConfirmDialog.types'
import styles from '../ConfirmDialog.module.css'

/** The dialog itself, inside its input scope. Focus returns where it was when it closes. */
export function ConfirmDialogContent({
  title,
  description,
  cancelLabel,
  confirmLabel,
  destructive = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps): React.JSX.Element {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  // Opening a modal dialog focuses its first button. A layout effect opens it before the
  // buttons register (in passive effects), so Cancel takes focus after that.
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
    if (action !== 'back') return
    playUiSound('back')
    onCancel()
  })

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      // The dialog itself is only hit outside the box, on its backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
    >
      {/* Its own navigation: directions move only between its buttons. */}
      <NavigationProvider scope="confirm-dialog">
        <FocusGroup id="confirm-dialog" className={styles.box}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
          <div className={styles.actions}>
            <Button focusId="cancel" autoFocus onPress={onCancel}>
              {cancelLabel}
            </Button>
            <Button
              focusId="confirm"
              variant={destructive ? 'danger' : 'default'}
              onPress={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </FocusGroup>
      </NavigationProvider>
    </dialog>
  )
}
