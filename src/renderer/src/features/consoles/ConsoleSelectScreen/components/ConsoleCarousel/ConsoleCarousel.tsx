import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FocusGroup } from '@renderer/core/navigation'

import { ConsoleCarouselDots } from './components/ConsoleCarouselDots'
import { ConsoleCarouselItem } from './components/ConsoleCarouselItem'
import type { ConsoleCarouselProps } from './ConsoleCarousel.types'
import styles from './ConsoleCarousel.module.css'

/**
 * Consoles side by side, with the selected one in front and its neighbors faded behind it.
 * The focused console is the selected one; it stops at both ends instead of wrapping.
 */
export function ConsoleCarousel({ consoles }: ConsoleCarouselProps): React.JSX.Element | null {
  const { t } = useTranslation('consoles')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const detailsId = useId()
  const selected = consoles[selectedIndex]

  if (!selected) return null

  return (
    <FocusGroup id="console-carousel" className={styles.carousel}>
      <ul className={styles.stage}>
        {consoles.map((gameConsole, index) => (
          <ConsoleCarouselItem
            key={gameConsole.id}
            gameConsole={gameConsole}
            offset={index - selectedIndex}
            autoFocus={index === 0}
            describedBy={index === selectedIndex ? detailsId : undefined}
            onFocus={() => setSelectedIndex(index)}
          />
        ))}
      </ul>
      <div id={detailsId} className={styles.details}>
        <p className={styles.facts}>{`${selected.manufacturer} · ${selected.releaseYear}`}</p>
        <p className={styles.games}>
          <span className={styles.gamesDot} />
          {t('carousel.gamesInstalled', { count: selected.gameCount })}
        </p>
      </div>
      <ConsoleCarouselDots count={consoles.length} selectedIndex={selectedIndex} />
    </FocusGroup>
  )
}
