import { useTranslation } from 'react-i18next'

import { POSITION_AS_TEXT_FROM } from '../Carousel.constants'
import type { CarouselIndicatorProps } from '../Carousel.types'
import styles from '../Carousel.module.css'

/**
 * Position of the selected item: a dot per item for short lists, "x / y" for long ones.
 * Visual only: the list of items (or the screen) tells assistive technologies the position.
 */
export function CarouselIndicator({
  count,
  selectedIndex
}: CarouselIndicatorProps): React.JSX.Element {
  const { t } = useTranslation()

  if (count >= POSITION_AS_TEXT_FROM) {
    return (
      <p className={styles.position} aria-hidden="true">
        {t('carousel.position', { position: selectedIndex + 1, total: count })}
      </p>
    )
  }

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
