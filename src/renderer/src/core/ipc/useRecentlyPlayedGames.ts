import { useEffect, useState } from 'react'

import type { RecentlyPlayedGame } from '@shared/api'

import { listRecentlyPlayedGames, subscribeToGameEnded, subscribeToMetadataChanged } from './games'

export interface RecentlyPlayedGamesState {
  /** `loading` until main first answers, `failed` when it can't. */
  status: 'loading' | 'ready' | 'failed'
  /** Newest first; empty until they are read. */
  games: RecentlyPlayedGame[]
}

const LOADING: RecentlyPlayedGamesState = { status: 'loading', games: [] }

/**
 * The games played before the last played one, read from main on mount and again whenever a
 * game ends, the session it was just played in being recorded by then, and whenever games'
 * metadata is found.
 */
export function useRecentlyPlayedGames(): RecentlyPlayedGamesState {
  const [state, setState] = useState(LOADING)

  useEffect(() => {
    let active = true
    const load = (): void => {
      listRecentlyPlayedGames().then(
        (games) => {
          if (active) setState({ status: 'ready', games })
        },
        () => {
          if (active) setState({ status: 'failed', games: [] })
        }
      )
    }

    load()
    const unsubscribeFromGameEnded = subscribeToGameEnded(load)
    const unsubscribeFromMetadata = subscribeToMetadataChanged(load)
    return () => {
      active = false
      unsubscribeFromGameEnded()
      unsubscribeFromMetadata()
    }
  }, [])

  return state
}
