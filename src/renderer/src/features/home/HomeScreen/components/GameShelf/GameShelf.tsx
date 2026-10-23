import { GameShelfCard } from './components/GameShelfCard'
import type { GameShelfProps } from './GameShelf.types'
import styles from './GameShelf.module.css'

/** A titled, horizontally scrolling row of game cards. */
export function GameShelf({ title, games }: GameShelfProps): React.JSX.Element {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <ul className={styles.rail}>
        {games.map((game) => (
          <li key={game.id}>
            <GameShelfCard game={game} />
          </li>
        ))}
      </ul>
    </section>
  )
}
