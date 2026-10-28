import { useEffect, useState } from 'react'

import type { RecentlyAddedGame } from '@shared/api'

import { listRecentlyAddedGames, subscribeToMetadataChanged } from './games'

export interface RecentlyAddedGamesState {
  /** `loading` until main answers, `failed` when it can't. */
  status: 'loading' | 'ready' | 'failed'
  /** Newest first; empty until they are read. */
  games: RecentlyAddedGame[]
}

const LOADING: RecentlyAddedGamesState = { status: 'loading', games: [] }

/**
 * The games most recently added to the library, read from main on mount and again whenever
 * games' metadata is found (their titles and covers).
 */
export function useRecentlyAddedGames(): RecentlyAddedGamesState {
  const [state, setState] = useState(LOADING)

  useEffect(() => {
    let active = true
    const load = (): void => {
      listRecentlyAddedGames().then(
        (games) => {
          if (active) setState({ status: 'ready', games })
        },
        () => {
          if (active) setState({ status: 'failed', games: [] })
        }
      )
    }

    load()
    const unsubscribe = subscribeToMetadataChanged(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return state
}
