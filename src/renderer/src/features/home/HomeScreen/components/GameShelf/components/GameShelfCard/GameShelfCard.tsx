import { useId } from 'react'

import { useFocusable } from '@renderer/core/navigation'

import type { GameShelfCardProps } from '../../GameShelf.types'
import styles from './GameShelfCard.module.css'

/** A game in a shelf, named by its title and described by its platform and caption. */
export function GameShelfCard({ game, onSelect }: GameShelfCardProps): React.JSX.Element {
  const { ref } = useFocusable<HTMLButtonElement>({ id: game.id })
  const titleId = useId()
  const platformId = useId()
  const captionId = useId()

  return (
    <button
      ref={ref}
      type="button"
      className={styles.card}
      aria-labelledby={titleId}
      aria-describedby={game.caption ? `${platformId} ${captionId}` : platformId}
      onClick={onSelect}
    >
      <img className={styles.artwork} src={game.imageUrl} alt="" />
      <span id={platformId} className={styles.platform}>
        {game.platform}
      </span>
      <span className={styles.info}>
        <span id={titleId} className={styles.title}>
          {game.title}
        </span>
        {game.caption && (
          <span id={captionId} className={styles.caption}>
            {game.caption}
          </span>
        )}
      </span>
    </button>
  )
}
