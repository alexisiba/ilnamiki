import type { GameCarouselItemProps } from '../GameCarousel.types'
import styles from '../GameCarousel.module.css'

const positionClass = (offset: number): string => {
  if (offset === 0) return styles.current
  return Math.abs(offset) === 1 ? styles.adjacent : styles.hidden
}

/**
 * A game in the carousel, slid to its place relative to the selected one. It never takes
 * focus, which stays on Play now: directions and clicks only select it.
 */
export function GameCarouselItem({
  game,
  offset,
  onSelect
}: GameCarouselItemProps): React.JSX.Element {
  return (
    <li
      className={`${styles.slot} ${positionClass(offset)}`}
      style={{ '--offset': offset } as React.CSSProperties}
    >
      <button
        type="button"
        tabIndex={-1}
        className={styles.item}
        aria-current={offset === 0 ? 'true' : undefined}
        // Keeps focus on Play now instead of moving it to the pressed game.
        onMouseDown={(event) => event.preventDefault()}
        onClick={onSelect}
      >
        <span className={styles.frame}>
          <img className={styles.image} src={game.imageUrl} alt="" />
        </span>
        <span className={styles.title}>{game.title}</span>
      </button>
    </li>
  )
}
