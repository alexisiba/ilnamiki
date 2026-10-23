import { useTranslation } from 'react-i18next'

import { EmulatorSetup } from './components/EmulatorSetup'
import { GameShelf } from './components/GameShelf'
import { HomeHero } from './components/HomeHero'
import {
  SAMPLE_LAST_PLAYED_GAME,
  SAMPLE_RECENT_GAMES,
  SAMPLE_RECENTLY_ADDED_GAMES
} from './HomeScreen.constants'
import { formatLastPlayed } from './HomeScreen.utils'
import styles from './HomeScreen.module.css'

export function HomeScreen(): React.JSX.Element {
  const { t, i18n } = useTranslation('home')
  const lastPlayedGame = SAMPLE_LAST_PLAYED_GAME

  if (!lastPlayedGame) {
    return (
      <div className={styles.emptyState}>
        <EmulatorSetup />
      </div>
    )
  }

  const now = new Date()
  const recentGames = SAMPLE_RECENT_GAMES.map(({ lastPlayedAt, ...game }) => ({
    ...game,
    caption: formatLastPlayed(lastPlayedAt, now, i18n.language)
  }))

  return (
    <div className={styles.content}>
      <HomeHero game={lastPlayedGame} />
      <GameShelf title={t('recentlyPlayed.title')} games={recentGames} />
      <GameShelf title={t('recentlyAdded.title')} games={SAMPLE_RECENTLY_ADDED_GAMES} />
    </div>
  )
}
