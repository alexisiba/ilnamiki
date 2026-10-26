import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Carousel } from '@renderer/components/Carousel'
import { playUiSound } from '@renderer/core/audio'
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

  // Only what is known: either can be missing, and then the line too.
  const facts = [selected.manufacturer, selected.releaseYear].filter((fact) => fact !== null)

  const select = (index: number): void => {
    // Focus coming back to the selected console (e.g. when shown) doesn't slide anything.
    if (index !== selectedIndex) playUiSound('carousel-slide')
    setSelectedIndex(index)
  }

  const details = (
    <div id={detailsId} className={styles.details}>
      {facts.length > 0 && <p className={styles.facts}>{facts.join(' · ')}</p>}
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
            onFocus={() => select(index)}
            onOpen={() => onOpenConsole(gameConsole.id)}
          />
        ))}
      </Carousel>
    </FocusGroup>
  )
}
