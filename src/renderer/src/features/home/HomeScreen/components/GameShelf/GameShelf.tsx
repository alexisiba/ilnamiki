import { FocusGroup } from '@renderer/core/navigation'

import { GameShelfCard } from './components/GameShelfCard'
import type { GameShelfProps } from './GameShelf.types'
import styles from './GameShelf.module.css'

/** A titled, horizontally scrolling row of game cards; the focused card stays at the start. */
export function GameShelf({ id, title, games }: GameShelfProps): React.JSX.Element {
  return (
    <FocusGroup id={id} as="section" scrollAlign="start" className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <ul className={styles.rail}>
        {games.map((game) => (
          <li key={game.id}>
            <GameShelfCard game={game} />
          </li>
        ))}
      </ul>
    </FocusGroup>
  )
}
