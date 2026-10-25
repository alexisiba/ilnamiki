import { useTranslation } from 'react-i18next'

import { useGameFolders, usePlatforms } from '@renderer/core/ipc'
import { getConsoleGamesPath, useOpenScreen } from '@renderer/core/navigation'

import { ConsoleCarousel } from './components/ConsoleCarousel'
import { LibraryEmpty } from './components/LibraryEmpty'
import { toGameConsoles } from './ConsoleSelectScreen.utils'
import styles from './ConsoleSelectScreen.module.css'

/**
 * First step of the library: choosing the console whose games to browse, among the installed
 * platforms with games. Until they are read nothing shows, so the empty view never flashes.
 */
export function ConsoleSelectScreen(): React.JSX.Element {
  const { t } = useTranslation()
  const openScreen = useOpenScreen()
  const platforms = usePlatforms()
  const folders = useGameFolders()
  const loading = platforms.status === 'loading' || folders.status === 'loading'
  const consoles = toGameConsoles(platforms.platforms, folders.folders)

  return (
    <div className={styles.screen}>
      <h1 className={styles.heading}>{t('navigation.library')}</h1>
      {consoles.length > 0 && (
        <ConsoleCarousel
          consoles={consoles}
          onOpenConsole={(consoleId) => openScreen(getConsoleGamesPath(consoleId))}
        />
      )}
      {!loading && consoles.length === 0 && <LibraryEmpty />}
    </div>
  )
}
