import { useTranslation } from 'react-i18next'

import { getConsoleGamesPath, useOpenScreen } from '@renderer/core/navigation'
import { SAMPLE_CONSOLES } from '@renderer/mocks/consoles'

import { ConsoleCarousel } from './components/ConsoleCarousel'
import styles from './ConsoleSelectScreen.module.css'

/** First step of the library: choosing the console whose games to browse. */
export function ConsoleSelectScreen(): React.JSX.Element {
  const { t } = useTranslation()
  const openScreen = useOpenScreen()

  return (
    <div className={styles.screen}>
      <h1 className={styles.heading}>{t('navigation.library')}</h1>
      <ConsoleCarousel
        consoles={SAMPLE_CONSOLES}
        onOpenConsole={(consoleId) => openScreen(getConsoleGamesPath(consoleId))}
      />
    </div>
  )
}
