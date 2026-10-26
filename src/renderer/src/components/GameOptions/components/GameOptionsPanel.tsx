import { useId, useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { playUiSound } from '@renderer/core/audio'
import { useInputAction } from '@renderer/core/input'
import { FocusGroup, NavigationProvider } from '@renderer/core/navigation'

import { useGamePlayer } from '../GameOptions.hooks'
import type { GameOptionsProps } from '../GameOptions.types'
import styles from '../GameOptions.module.css'
import { GameCoreOptions } from './GameCoreOptions'

/**
 * The panel itself, inside its input scope: the game's title and what can be set for it, and
 * Close at the bottom. Close takes focus when there is nothing to choose. Focus returns where it
 * was when it closes.
 */
export function GameOptionsPanel({ gameId, title, onClose }: GameOptionsProps): React.JSX.Element {
  const { t } = useTranslation()
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const { status, player, choose } = useGamePlayer(gameId)
  const hasChoice = player !== null && player.cores.length > 1

  // Opening a modal dialog focuses its first button. A layout effect opens it before the
  // buttons register (in passive effects), so the one marked to take focus takes it after.
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
    onClose()
  })

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      // The dialog itself is only hit outside the panel, on its backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      {/* Its own navigation: directions move only inside the panel. */}
      <NavigationProvider scope="game-options">
        <FocusGroup id="game-options" movement="rows" className={styles.panel}>
          <div className={styles.header}>
            <p className={styles.eyebrow}>{t('gameOptions.title')}</p>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
          </div>
          {status === 'ready' && player && <GameCoreOptions player={player} choose={choose} />}
          {status === 'ready' && !player && (
            <p className={styles.message}>{t('gameOptions.notFound')}</p>
          )}
          {status === 'failed' && <p className={styles.message}>{t('gameOptions.failed')}</p>}
          <div className={styles.actions}>
            {/* Only while the panel is read, so it doesn't take focus from the choice. */}
            {status !== 'loading' && (
              <Button focusId="close" autoFocus={!hasChoice} onPress={onClose}>
                {t('gameOptions.close')}
              </Button>
            )}
          </div>
        </FocusGroup>
      </NavigationProvider>
    </dialog>
  )
}
