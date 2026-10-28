import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { GameCarousel } from '@renderer/components/GameCarousel'
import { playUiSound } from '@renderer/core/audio'
import { useInputAction } from '@renderer/core/input'
import { useFolderGames, useGameFolders, usePlatforms } from '@renderer/core/ipc'
import { useRememberedState } from '@renderer/core/navigation'
import { backdropOf } from '@renderer/utils/gameArtwork'
import { toGameConsoles } from '@renderer/utils/gameConsoles'

import { GamePanel } from './components/GamePanel'
import { toLibraryGame } from './ConsoleGamesScreen.utils'
import styles from './ConsoleGamesScreen.module.css'

/**
 * A console's games, opened from the library: a carousel of the games saved from its folder,
 * by title, and the selected one's details, with Play now focused. Until the console is known
 * nothing shows, and until its games are read only its heading does, so no message flashes.
 */
export function ConsoleGamesScreen(): React.JSX.Element | null {
  const { t } = useTranslation('games')
  const { consoleId = '' } = useParams()
  const platforms = usePlatforms()
  const folders = useGameFolders()
  const folder = folders.folders.find(({ platformId }) => platformId === consoleId)
  const { status, games: folderGames } = useFolderGames(folder?.id)
  const gameConsole = toGameConsoles(platforms.platforms, folders.folders).find(
    ({ id }) => id === consoleId
  )
  const games = folderGames.map(toLibraryGame)
  // Kept per console, so coming back from another section shows the same game.
  const [rememberedIndex, setSelectedIndex] = useRememberedState('selected-game', 0)
  // The folder may have fewer games than when the index was kept (e.g. scanned again).
  const selectedIndex = Math.min(rememberedIndex, Math.max(games.length - 1, 0))
  const statusId = useId()
  const game = games[selectedIndex]

  const selectGame = (index: number): void => {
    // At either end there is no other game to switch to.
    if (index === selectedIndex) return
    playUiSound('carousel-slide')
    setSelectedIndex(index)
  }

  // Focus stays on Play now, so left and right switch games instead of moving focus.
  useInputAction((action) => {
    if (action === 'left') selectGame(Math.max(selectedIndex - 1, 0))
    if (action === 'right') selectGame(Math.min(selectedIndex + 1, games.length - 1))
  })

  if (!gameConsole && (platforms.status === 'loading' || folders.status === 'loading')) {
    return null
  }

  const gamesRead = status !== 'loading'
  if (!gameConsole || (status === 'ready' && !game)) {
    return (
      <div className={styles.screen}>
        <p className={styles.notFound}>{t('consoleGames.notFound')}</p>
      </div>
    )
  }

  const facts = [
    gamesRead && t('consoleGames.gamesInstalled', { count: games.length }),
    gameConsole.releaseYear
  ].filter((fact) => fact !== null && fact !== false)

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1 className={styles.title}>{gameConsole.name}</h1>
        {facts.length > 0 && <p className={styles.facts}>{facts.join(' · ')}</p>}
      </div>
      {status === 'failed' && <p className={styles.notFound}>{t('consoleGames.gamesFailed')}</p>}
      {game && (
        <div className={styles.columns}>
          <GameCarousel
            games={games}
            selectedIndex={selectedIndex}
            statusId={statusId}
            onSelect={setSelectedIndex}
          />
          <GamePanel
            game={game}
            backdrop={backdropOf(folderGames[selectedIndex].artwork)}
            describedBy={statusId}
          />
        </div>
      )}
    </div>
  )
}
