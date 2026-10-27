import { useTranslation } from 'react-i18next'

import {
  useEmulators,
  useGameFolders,
  useLastPlayedGame,
  usePlatforms,
  useRecentlyAddedGames,
  useRecentlyPlayedGames
} from '@renderer/core/ipc'
import { getGameDetailsPath, useOpenScreen } from '@renderer/core/navigation'

import { ContinueHero } from './components/ContinueHero'
import { EmulatorSetup } from './components/EmulatorSetup'
import { GameSetup } from './components/GameSetup'
import { GameShelf } from './components/GameShelf'
import { PlatformSetup } from './components/PlatformSetup'
import { ReadyHero } from './components/ReadyHero'
import {
  toContinueGame,
  toRecentlyAddedShelfGame,
  toRecentlyPlayedShelfGame
} from './HomeScreen.utils'
import styles from './HomeScreen.module.css'

/**
 * Home, checking in order what is needed to play: while the user has no emulator, how to set
 * up the first one; while their emulators play no platform, how to set one up for the
 * consoles; while no folder has games, how to add one; while no game was played, the games
 * ready to play; and otherwise the last played game and, once two games were played, the games
 * played before it. Once there are games, the ones added last follow, as soon as they are read.
 * A game removed from the library doesn't count as played, and the games of a platform
 * turned off don't count at all.
 * Until what a check needs is read nothing shows, so no view flashes.
 */
export function HomeScreen(): React.JSX.Element | null {
  const { t, i18n } = useTranslation('home')
  const openScreen = useOpenScreen()
  const emulators = useEmulators()
  const platforms = usePlatforms()
  const gameFolders = useGameFolders()
  const lastPlayed = useLastPlayedGame()
  const recentlyAdded = useRecentlyAddedGames()
  const recentlyPlayed = useRecentlyPlayedGames()

  if (emulators.status === 'loading') return null

  if (emulators.emulators.length === 0) {
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

  if (gameFolders.status === 'loading') return null

  const disabledPlatformIds = new Set(
    platforms.platforms.filter((platform) => !platform.isEnabled).map((platform) => platform.id)
  )
  // The games of a platform turned off don't count, so with every platform off it asks again.
  const gameCount = gameFolders.folders
    .filter((folder) => !disabledPlatformIds.has(folder.platformId))
    .reduce((total, folder) => total + folder.gameCount, 0)

  if (gameCount === 0) {
    return (
      <div className={styles.emptyState}>
        <GameSetup emulators={emulators.emulators} platforms={platforms.platforms} />
      </div>
    )
  }

  if (lastPlayed.status === 'loading') return null

  const openGame = (gameId: string): void => {
    openScreen(getGameDetailsPath(gameId))
  }

  const recentlyAddedShelf = recentlyAdded.games.length > 0 && (
    <GameShelf
      id="home-recently-added"
      title={t('recentlyAdded.title')}
      games={recentlyAdded.games.map((game) => toRecentlyAddedShelfGame(game, platforms.platforms))}
      onSelectGame={openGame}
    />
  )

  if (!lastPlayed.game) {
    return (
      <div className={styles.content}>
        <ReadyHero
          gameCount={gameCount}
          emulatorCount={emulators.emulators.length}
          platformCount={platforms.platforms.length - disabledPlatformIds.size}
        />
        {recentlyAddedShelf}
      </div>
    )
  }

  const now = new Date()
  const recentlyPlayedGames = recentlyPlayed.games.map((game) =>
    toRecentlyPlayedShelfGame(game, platforms.platforms, now, i18n.language)
  )

  return (
    <div className={styles.content}>
      <ContinueHero game={toContinueGame(lastPlayed.game, platforms.platforms)} />
      {/* The last played game is the hero's, so this shows from the second game played. */}
      {recentlyPlayedGames.length > 0 && (
        <GameShelf
          id="home-recently-played"
          title={t('recentlyPlayed.title')}
          games={recentlyPlayedGames}
          onSelectGame={openGame}
        />
      )}
      {recentlyAddedShelf}
    </div>
  )
}
