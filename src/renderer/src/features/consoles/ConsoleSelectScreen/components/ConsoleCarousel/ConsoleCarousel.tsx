import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Carousel } from '@renderer/components/Carousel'
import { FocusGroup, useLastFocusedId } from '@renderer/core/navigation'

import { ConsoleCarouselItem } from './components/ConsoleCarouselItem'
import type { ConsoleCarouselProps } from './ConsoleCarousel.types'
import styles from './ConsoleCarousel.module.css'

const GROUP_ID = 'console-carousel'

/**
 * Consoles in a carousel, with a light behind the selected one. The focused console is the
 * selected one, so directions move through the consoles.
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

  const details = (
    <div id={detailsId} className={styles.details}>
      <p className={styles.facts}>{`${selected.manufacturer} · ${selected.releaseYear}`}</p>
      <p className={styles.games}>
        <span className={styles.gamesDot} />
        {t('carousel.gamesInstalled', { count: selected.gameCount })}
      </p>
    </div>
  )

  return (
    <FocusGroup id={GROUP_ID}>
      <Carousel
        selectedIndex={selectedIndex}
        spacing="var(--console-spacing)"
        details={details}
        stageClassName={styles.stage}
      >
        {consoles.map((gameConsole, index) => (
          <ConsoleCarouselItem
            key={gameConsole.id}
            gameConsole={gameConsole}
            selected={index === selectedIndex}
            autoFocus={index === 0}
            describedBy={index === selectedIndex ? detailsId : undefined}
            onFocus={() => setSelectedIndex(index)}
            onOpen={() => onOpenConsole(gameConsole.id)}
          />
        ))}
      </Carousel>
    </FocusGroup>
  )
}
