import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FocusGroup, useLastFocusedId } from '@renderer/core/navigation'

import { ConsoleCarouselDots } from './components/ConsoleCarouselDots'
import { ConsoleCarouselItem } from './components/ConsoleCarouselItem'
import type { ConsoleCarouselProps } from './ConsoleCarousel.types'
import styles from './ConsoleCarousel.module.css'

const GROUP_ID = 'console-carousel'

/**
 * Consoles side by side, with the selected one in front and its neighbors faded behind it.
 * The focused console is the selected one; it stops at both ends instead of wrapping.
 */
export function ConsoleCarousel({
  consoles,
  onOpenConsole
}: ConsoleCarouselProps): React.JSX.Element | null {
  const { t } = useTranslation('consoles')
  // Coming back, start on the console focus returns to, so the carousel does not slide there.
  const lastFocusedId = useLastFocusedId(GROUP_ID)
  const [selectedIndex, setSelectedIndex] = useState(() =>
    Math.max(
      consoles.findIndex(({ id }) => id === lastFocusedId),
      0
    )
  )
  const detailsId = useId()
  const selected = consoles[selectedIndex]

  if (!selected) return null

  return (
    <FocusGroup id={GROUP_ID} className={styles.carousel}>
      <ul className={styles.stage}>
        {consoles.map((gameConsole, index) => (
          <ConsoleCarouselItem
            key={gameConsole.id}
            gameConsole={gameConsole}
            offset={index - selectedIndex}
            autoFocus={index === 0}
            describedBy={index === selectedIndex ? detailsId : undefined}
            onFocus={() => setSelectedIndex(index)}
            onOpen={() => onOpenConsole(gameConsole.id)}
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
