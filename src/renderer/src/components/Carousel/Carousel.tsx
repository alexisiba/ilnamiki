import { Children, isValidElement } from 'react'

import { CarouselIndicator } from './components/CarouselIndicator'
import type { CarouselProps } from './Carousel.types'
import styles from './Carousel.module.css'

const positionClass = (offset: number): string => {
  if (offset === 0) return styles.current
  return Math.abs(offset) === 1 ? styles.adjacent : styles.hidden
}

/**
 * Items side by side, with the selected one in front and its neighbors set back and faded
 * behind it; items further away are hidden. It only lays items out: what is selected, and
 * how focus and input change it, is up to the screen.
 */
export function Carousel({
  selectedIndex,
  spacing,
  children,
  details,
  stageClassName
}: CarouselProps): React.JSX.Element {
  const items = Children.toArray(children)

  return (
    <div className={styles.carousel}>
      <ul
        className={stageClassName ? `${styles.stage} ${stageClassName}` : styles.stage}
        style={{ '--carousel-spacing': spacing } as React.CSSProperties}
      >
        {items.map((item, index) => {
          const offset = index - selectedIndex
          return (
            <li
              key={isValidElement(item) ? item.key : index}
              className={`${styles.slot} ${positionClass(offset)}`}
              style={{ '--offset': offset } as React.CSSProperties}
            >
              {item}
            </li>
          )
        })}
      </ul>
      {details}
      <CarouselIndicator count={items.length} selectedIndex={selectedIndex} />
    </div>
  )
}
