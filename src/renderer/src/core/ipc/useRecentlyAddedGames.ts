import { useEffect, useState } from 'react'

import type { RecentlyAddedGame } from '@shared/api'

import { listRecentlyAddedGames } from './games'

export interface RecentlyAddedGamesState {
  /** `loading` until main answers, `failed` when it can't. */
  status: 'loading' | 'ready' | 'failed'
  /** Newest first; empty until they are read. */
  games: RecentlyAddedGame[]
}

const LOADING: RecentlyAddedGamesState = { status: 'loading', games: [] }

/** The games most recently added to the library, read from main on mount. */
export function useRecentlyAddedGames(): RecentlyAddedGamesState {
  const [state, setState] = useState(LOADING)

  useEffect(() => {
    let active = true
    listRecentlyAddedGames().then(
      (games) => {
        if (active) setState({ status: 'ready', games })
      },
      () => {
        if (active) setState({ status: 'failed', games: [] })
      }
    )
    return () => {
      active = false
    }
  }, [])

  return state
}
