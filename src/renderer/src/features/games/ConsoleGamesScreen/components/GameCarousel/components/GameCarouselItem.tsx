import type { GameCarouselItemProps } from '../GameCarousel.types'
import styles from '../GameCarousel.module.css'

/**
 * A game in the carousel. It never takes focus, which stays on Play now: directions and
 * clicks only select it.
 */
export function GameCarouselItem({
  game,
  selected,
  onSelect
}: GameCarouselItemProps): React.JSX.Element {
  return (
    <button
      type="button"
      tabIndex={-1}
      className={selected ? `${styles.item} ${styles.selected}` : styles.item}
      aria-current={selected ? 'true' : undefined}
      // Keeps focus on Play now instead of moving it to the pressed game.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
    >
      <span className={styles.frame}>
        <img className={styles.image} src={game.imageUrl} alt="" />
      </span>
      <span className={styles.title}>{game.title}</span>
    </button>
  )
}
