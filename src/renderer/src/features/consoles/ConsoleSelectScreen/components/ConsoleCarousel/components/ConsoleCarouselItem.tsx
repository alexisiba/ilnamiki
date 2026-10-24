import { useRef } from 'react'

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
  const { ref } = useFocusable<HTMLButtonElement>({
    id: gameConsole.id,
    autoFocus,
    focusOnHover: false
  })
  // Read before the press focuses (and so selects) the console, in the capture phase.
  const pressedWhileSelected = useRef(false)

  const handleClick = (event: React.MouseEvent): void => {
    // A confirm clicks the element without a pointer press (detail 0).
    if (event.detail === 0 || pressedWhileSelected.current) onOpen()
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
      <img className={styles.image} src={gameConsole.imageUrl} alt="" />
      <span className={styles.name}>{gameConsole.name}</span>
    </button>
  )
}
