import { useTranslation } from 'react-i18next'

import { getGameDetailsPath, useOpenScreen } from '@renderer/core/navigation'
import { getSampleGame } from '@renderer/mocks/games'
import type { Game } from '@renderer/types/game'

import { EmulatorSetup } from './components/EmulatorSetup'
import { GameShelf, type ShelfGame } from './components/GameShelf'
import { HomeHero } from './components/HomeHero'
import {
  SAMPLE_LAST_PLAYED_GAME_ID,
  SAMPLE_RECENT_GAME_IDS,
  SAMPLE_RECENTLY_ADDED_GAME_IDS
} from './HomeScreen.constants'
import { formatLastPlayed } from './HomeScreen.utils'
import styles from './HomeScreen.module.css'

const gamesWithIds = (ids: string[]): Game[] => ids.flatMap((id) => getSampleGame(id) ?? [])

const toShelfGame = ({ id, title, platform, imageUrl }: Game): ShelfGame => ({
  id,
  title,
  platform,
  imageUrl
})

export function HomeScreen(): React.JSX.Element {
  const { t, i18n } = useTranslation('home')
  const openScreen = useOpenScreen()
  const lastPlayedGame = SAMPLE_LAST_PLAYED_GAME_ID && getSampleGame(SAMPLE_LAST_PLAYED_GAME_ID)

  if (!lastPlayedGame) {
    return (
      <div className={styles.emptyState}>
        <EmulatorSetup />
      </div>
    )
  }

  const openGame = (gameId: string): void => {
    openScreen(getGameDetailsPath(gameId))
  }

  const now = new Date()
  const recentGames = gamesWithIds(SAMPLE_RECENT_GAME_IDS).map((game) => ({
    ...toShelfGame(game),
    caption: formatLastPlayed(game.lastPlayedAt, now, i18n.language)
  }))
  const recentlyAddedGames = gamesWithIds(SAMPLE_RECENTLY_ADDED_GAME_IDS).map(toShelfGame)

  return (
    <div className={styles.content}>
      <HomeHero game={lastPlayedGame} />
      <GameShelf
        id="home-recently-played"
        title={t('recentlyPlayed.title')}
        games={recentGames}
        onSelectGame={openGame}
      />
      <GameShelf
        id="home-recently-added"
        title={t('recentlyAdded.title')}
        games={recentlyAddedGames}
        onSelectGame={openGame}
      />
    </div>
  )
}
