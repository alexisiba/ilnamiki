import { EmulatorSetup } from './components/EmulatorSetup'
import { HomeHero } from './components/HomeHero'
import { SAMPLE_LAST_PLAYED_GAME } from './HomeScreen.constants'
import styles from './HomeScreen.module.css'

export function HomeScreen(): React.JSX.Element {
  const lastPlayedGame = SAMPLE_LAST_PLAYED_GAME

  if (!lastPlayedGame) {
    return (
      <div className={styles.emptyState}>
        <EmulatorSetup />
      </div>
    )
  }

  return (
    <div className={styles.content}>
      <HomeHero game={lastPlayedGame} />
    </div>
  )
}
