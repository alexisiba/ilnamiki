import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { OnScreenKeyboard } from '@renderer/components/OnScreenKeyboard'
import { playUiSound } from '@renderer/core/audio'
import { useInputAction } from '@renderer/core/input'
import { getGameDetailsPath, NavigationProvider, useOpenScreen } from '@renderer/core/navigation'
import { SAMPLE_GAMES } from '@renderer/mocks/games'
import type { Game, LibraryGame } from '@renderer/types/game'

import { SearchField } from './components/SearchField'
import { SearchGuide } from './components/SearchGuide'
import { SearchResults } from './components/SearchResults'
import { SEARCH_RESULTS_LIMIT } from './SearchDialog.constants'
import type { SearchDialogProps } from './SearchDialog.types'
import { searchGames } from './SearchDialog.utils'
import styles from './SearchDialog.module.css'

/**
 * Search over the current screen, which blurs behind it. It is modal: the screen behind is
 * inert, back closes it, and focus returns where it was. Closing unmounts it, so it always
 * opens empty.
 *
 * Submitting searches the library's games. When some match, the keyboard gives way to them
 * and focus moves to the first one; confirming the field (or typing in it) brings the
 * keyboard back. When none match, the keyboard stays below the message.
 */
export function SearchDialog({ onClose }: SearchDialogProps): React.JSX.Element {
  const { t } = useTranslation('search')
  const openScreen = useOpenScreen()
  const ref = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState('')
  /** The games the last search found; `undefined` before searching and while typing again. */
  const [results, setResults] = useState<Game[]>()
  const showingResults = results !== undefined && results.length > 0

  useEffect(() => {
    const dialog = ref.current
    const previousFocus = document.activeElement
    dialog?.showModal()

    return () => {
      dialog?.close()
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true })
    }
  }, [])

  useInputAction((action) => {
    if (action !== 'back') return
    playUiSound('back')
    onClose()
  })

  const type = (value: string): void => {
    setQuery(value)
    setResults(undefined)
  }

  const search = (): void => {
    if (query.trim()) setResults(searchGames(query, SAMPLE_GAMES, SEARCH_RESULTS_LIMIT))
  }

  const openGame = (game: LibraryGame): void => {
    // Back from the game returns to the screen search was opened over.
    openScreen(getGameDetailsPath(game.id))
    onClose()
  }

  return (
    <dialog ref={ref} className={styles.dialog} aria-label={t('dialog')}>
      {/* Its own navigation: directions move only between the field, results and keys. */}
      <NavigationProvider scope="search">
        <SearchField
          value={query}
          onChange={type}
          onActivate={showingResults ? () => setResults(undefined) : undefined}
        />
        {results && <SearchResults query={query} results={results} onOpen={openGame} />}
        {!showingResults && (
          <div className={styles.keyboard}>
            <OnScreenKeyboard
              value={query}
              onChange={type}
              onSubmit={search}
              actionLabel={t('submit')}
            />
          </div>
        )}
      </NavigationProvider>
      <SearchGuide />
    </dialog>
  )
}
