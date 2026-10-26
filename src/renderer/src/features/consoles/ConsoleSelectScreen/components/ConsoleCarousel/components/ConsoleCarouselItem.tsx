import { ImageOff } from 'lucide-react'
import { useRef } from 'react'

import { playUiSound } from '@renderer/core/audio'
import { useFocusable } from '@renderer/core/navigation'

import type { ConsoleCarouselItemProps } from '../ConsoleCarousel.types'
import styles from '../ConsoleCarousel.module.css'

/**
 * A console in the carousel. It does not take focus on hover: focusing slides it to the
 * center, away from the pointer. Confirming it or clicking it while selected opens it;
 * clicking it while beside the selection selects it.
 */
export function ConsoleCarouselItem({
  gameConsole,
  selected,
  autoFocus,
  describedBy,
  onFocus,
  onOpen
}: ConsoleCarouselItemProps): React.JSX.Element {
  // Only opening it sounds: a click that selects it slides the carousel instead.
  const { ref } = useFocusable<HTMLButtonElement>({
    id: gameConsole.id,
    autoFocus,
    focusOnHover: false,
    sound: false
  })
  // Read before the press focuses (and so selects) the console, in the capture phase.
  const pressedWhileSelected = useRef(false)

  const handleClick = (event: React.MouseEvent): void => {
    // A confirm clicks the element without a pointer press (detail 0).
    if (event.detail !== 0 && !pressedWhileSelected.current) return
    playUiSound('select')
    onOpen()
  }

  return (
    <button
      ref={ref}
      type="button"
      className={selected ? `${styles.item} ${styles.selected}` : styles.item}
      aria-current={selected ? 'true' : undefined}
      aria-describedby={describedBy}
      onFocus={onFocus}
      onPointerDownCapture={() => {
        pressedWhileSelected.current = selected
      }}
      onClick={handleClick}
    >
      {gameConsole.imageUrl ? (
        <img className={styles.image} src={gameConsole.imageUrl} alt="" />
      ) : (
        // No render of this console ships with the app yet.
        <span className={styles.noImage}>
          <ImageOff className={styles.noImageIcon} aria-hidden />
        </span>
      )}
      <span className={styles.name}>{gameConsole.name}</span>
    </button>
  )
}
