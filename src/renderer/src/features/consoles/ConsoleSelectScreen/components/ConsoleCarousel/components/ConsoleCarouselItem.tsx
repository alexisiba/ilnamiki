import { useRef } from 'react'

import { useFocusable } from '@renderer/core/navigation'

import type { ConsoleCarouselItemProps } from '../ConsoleCarousel.types'
import styles from '../ConsoleCarousel.module.css'

const positionClass = (offset: number): string => {
  if (offset === 0) return styles.current
  return Math.abs(offset) === 1 ? styles.adjacent : styles.hidden
}

/**
 * A console in the carousel, slid to its place relative to the selected one. It does not take
 * focus on hover: focusing slides it to the center, away from the pointer. Confirming it or
 * clicking it while selected opens it; clicking it while beside the selection selects it.
 */
export function ConsoleCarouselItem({
  gameConsole,
  offset,
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
    <li
      className={`${styles.slot} ${positionClass(offset)}`}
      style={{ '--offset': offset } as React.CSSProperties}
    >
      <button
        ref={ref}
        type="button"
        className={styles.item}
        aria-current={offset === 0 ? 'true' : undefined}
        aria-describedby={describedBy}
        onFocus={onFocus}
        onPointerDownCapture={() => {
          pressedWhileSelected.current = offset === 0
        }}
        onClick={handleClick}
      >
        <img className={styles.image} src={gameConsole.imageUrl} alt="" />
        <span className={styles.name}>{gameConsole.name}</span>
      </button>
    </li>
  )
}
