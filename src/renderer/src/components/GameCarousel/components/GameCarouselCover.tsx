import noImage from '@renderer/assets/images/games/no-image.webp'

import type { GameCarouselCoverProps } from '../GameCarousel.types'
import styles from '../GameCarousel.module.css'

/**
 * What a game shows in the carousel: its artwork in a frame (a generic image when it has
 * none), and its title.
 */
export function GameCarouselCover({ game }: GameCarouselCoverProps): React.JSX.Element {
  return (
    <>
      <span className={styles.frame}>
        <img className={styles.image} src={game.imageUrl ?? noImage} alt="" />
      </span>
      <span className={styles.title}>{game.title}</span>
    </>
  )
}
