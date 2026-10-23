import { useTranslation } from 'react-i18next'

import { Carousel } from '@renderer/components/Carousel'

import { GameCarouselItem } from './components/GameCarouselItem'
import type { GameCarouselProps } from './GameCarousel.types'
import styles from './GameCarousel.module.css'

/** Games in a carousel, with the selected one's facts below it. */
export function GameCarousel({
  games,
  selectedIndex,
  statusId,
  onSelect
}: GameCarouselProps): React.JSX.Element | null {
  const { t } = useTranslation('games')
  const selected = games[selectedIndex]

  if (!selected) return null

  const facts = [
    selected.releaseYear,
    selected.genre,
    t('details.players', { count: selected.players })
  ]

  const details = (
    <>
      <p className={styles.facts}>{facts.join(' · ')}</p>
      {/* Focus stays on Play now, so changing games is announced instead. */}
      <p id={statusId} className={styles.status} aria-live="polite">
        {t('consoleGames.selected', {
          title: selected.title,
          position: selectedIndex + 1,
          total: games.length
        })}
      </p>
    </>
  )

  return (
    <Carousel selectedIndex={selectedIndex} spacing="var(--game-spacing)" details={details}>
      {games.map((game, index) => (
        <GameCarouselItem
          key={game.id}
          game={game}
          selected={index === selectedIndex}
          onSelect={() => onSelect(index)}
        />
      ))}
    </Carousel>
  )
}
