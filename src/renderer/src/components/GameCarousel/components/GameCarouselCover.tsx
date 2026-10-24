import type { GameCarouselCoverProps } from '../GameCarousel.types'
import styles from '../GameCarousel.module.css'

/** What a game shows in the carousel: its artwork in a frame, and its title. */
export function GameCarouselCover({ game }: GameCarouselCoverProps): React.JSX.Element {
  return (
    <>
      <span className={styles.frame}>
        <img className={styles.image} src={game.imageUrl} alt="" />
      </span>
      <span className={styles.title}>{game.title}</span>
    </>
  )
}
