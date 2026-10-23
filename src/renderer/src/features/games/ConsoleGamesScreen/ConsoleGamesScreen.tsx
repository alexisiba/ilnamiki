import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { useInputAction } from '@renderer/core/input'
import { useRememberedState } from '@renderer/core/navigation'
import { getSampleConsole } from '@renderer/mocks/consoles'
import { SAMPLE_GAMES } from '@renderer/mocks/games'

import { GameCarousel } from './components/GameCarousel'
import { GamePanel } from './components/GamePanel'
import styles from './ConsoleGamesScreen.module.css'

/**
 * A console's games, opened from the library: a carousel of games and the selected one's
 * details, with Play now focused. Every console shows the sample games for now.
 */
export function ConsoleGamesScreen(): React.JSX.Element {
  const { t } = useTranslation('games')
  const { consoleId = '' } = useParams()
  const gameConsole = getSampleConsole(consoleId)
  const games = SAMPLE_GAMES
  // Kept per console, so coming back from another section shows the same game.
  const [selectedIndex, setSelectedIndex] = useRememberedState('selected-game', 0)
  const statusId = useId()
  const game = games[selectedIndex]

  // Focus stays on Play now, so left and right switch games instead of moving focus.
  useInputAction((action) => {
    if (action === 'left') setSelectedIndex((index) => Math.max(index - 1, 0))
    if (action === 'right') setSelectedIndex((index) => Math.min(index + 1, games.length - 1))
  })

  if (!gameConsole || !game) {
    return (
      <div className={styles.screen}>
        <p className={styles.notFound}>{t('consoleGames.notFound')}</p>
      </div>
    )
  }

  const facts = [t('consoleGames.gamesInstalled', { count: games.length }), gameConsole.releaseYear]

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1 className={styles.title}>{gameConsole.name}</h1>
        <p className={styles.facts}>{facts.join(' · ')}</p>
      </div>
      <div className={styles.columns}>
        <GameCarousel
          games={games}
          selectedIndex={selectedIndex}
          statusId={statusId}
          onSelect={setSelectedIndex}
        />
        <GamePanel game={game} describedBy={statusId} />
      </div>
    </div>
  )
}
