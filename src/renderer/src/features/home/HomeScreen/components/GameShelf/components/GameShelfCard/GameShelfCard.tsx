import type { GameShelfCardProps } from '../../GameShelf.types'
import styles from './GameShelfCard.module.css'

export function GameShelfCard({ game }: GameShelfCardProps): React.JSX.Element {
  return (
    <article className={styles.card}>
      <img className={styles.artwork} src={game.imageUrl} alt="" />
      <span className={styles.platform}>{game.platform}</span>
      <div className={styles.info}>
        <h3 className={styles.title}>{game.title}</h3>
        {game.caption && <p className={styles.caption}>{game.caption}</p>}
      </div>
    </article>
  )
}
