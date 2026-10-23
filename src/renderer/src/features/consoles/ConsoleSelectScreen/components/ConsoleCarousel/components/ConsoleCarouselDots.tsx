import type { ConsoleCarouselDotsProps } from '../ConsoleCarousel.types'
import styles from '../ConsoleCarousel.module.css'

/**
 * Position of the selected console within the carousel. Visual only: the list of consoles
 * already tells assistive technologies how many there are and which one is current.
 */
export function ConsoleCarouselDots({
  count,
  selectedIndex
}: ConsoleCarouselDotsProps): React.JSX.Element {
  return (
    <div className={styles.dots} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={index === selectedIndex ? `${styles.dot} ${styles.dotSelected}` : styles.dot}
        />
      ))}
    </div>
  )
}
