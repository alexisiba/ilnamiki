import { useRef } from 'react'

import noConsoleImage from '@renderer/assets/images/consoles/no-console-image.webp'
import { playUiSound } from '@renderer/core/audio'
import { usePlatformPhoto } from '@renderer/core/ipc'
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
  // The photo downloaded by main, else, once main answers it has none, a generic console.
  const photo = usePlatformPhoto(gameConsole.id)
  const imageUrl = photo.url ?? (photo.status === 'ready' ? noConsoleImage : null)

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
      {imageUrl ? (
        <img className={styles.image} src={imageUrl} alt="" />
      ) : (
        // Empty while the photo is asked for, so the generic console doesn't flash first.
        <span className={styles.imagePending} />
      )}
      <span className={styles.name}>{gameConsole.name}</span>
    </button>
  )
}
