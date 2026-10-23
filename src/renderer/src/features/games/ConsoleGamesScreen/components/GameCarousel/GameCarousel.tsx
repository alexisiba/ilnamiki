import { useTranslation } from 'react-i18next'

import { GameCarouselItem } from './components/GameCarouselItem'
import type { GameCarouselProps } from './GameCarousel.types'
import styles from './GameCarousel.module.css'

/**
 * Games side by side, with the selected one in front and its neighbors faded behind it,
 * followed by its facts and its position in the list.
 */
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
  const position = { position: selectedIndex + 1, total: games.length }

  return (
    <div className={styles.carousel}>
      <ul className={styles.stage}>
        {games.map((game, index) => (
          <GameCarouselItem
            key={game.id}
            game={game}
            offset={index - selectedIndex}
            onSelect={() => onSelect(index)}
          />
        ))}
      </ul>
      <p className={styles.facts}>{facts.join(' · ')}</p>
      {/* The status below already announces the position. */}
      <p className={styles.position} aria-hidden="true">
        {t('consoleGames.position', position)}
      </p>
      {/* Focus stays on Play now, so changing games is announced instead. */}
      <p id={statusId} className={styles.status} aria-live="polite">
        {t('consoleGames.selected', { title: selected.title, ...position })}
      </p>
    </div>
  )
}
