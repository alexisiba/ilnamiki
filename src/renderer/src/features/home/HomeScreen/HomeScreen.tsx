import { useTranslation } from 'react-i18next'

import { useEmulators, usePlatforms } from '@renderer/core/ipc'
import { getGameDetailsPath, useOpenScreen } from '@renderer/core/navigation'
import { getSampleGame } from '@renderer/mocks/games'
import type { Game } from '@renderer/types/game'

import { EmulatorSetup } from './components/EmulatorSetup'
import { GameShelf, type ShelfGame } from './components/GameShelf'
import { HomeHero } from './components/HomeHero'
import { PlatformSetup } from './components/PlatformSetup'
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

/**
 * Home, checking in order what is needed to play: while the user has no emulator, how to set
 * up the first one; while their emulators play no platform, how to set one up for the
 * consoles; and otherwise the last played game and the rows of games (sample games for now).
 * Until what a check needs is read nothing shows, so no view flashes.
 */
export function HomeScreen(): React.JSX.Element | null {
  const { t, i18n } = useTranslation('home')
  const openScreen = useOpenScreen()
  const emulators = useEmulators()
  const platforms = usePlatforms()
  const lastPlayedGame = SAMPLE_LAST_PLAYED_GAME_ID && getSampleGame(SAMPLE_LAST_PLAYED_GAME_ID)

  if (emulators.status === 'loading') return null

  if (emulators.emulators.length === 0 || !lastPlayedGame) {
    return (
      <div className={styles.emptyState}>
        <EmulatorSetup />
      </div>
    )
  }

  if (platforms.status === 'loading') return null

  if (platforms.platforms.length === 0) {
    return (
      <div className={styles.emptyState}>
        <PlatformSetup />
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
