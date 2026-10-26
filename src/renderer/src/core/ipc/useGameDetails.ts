import { useEffect, useState } from 'react'

import type { GameDetails } from '@shared/api'

import { getGameDetails, subscribeToGameEnded } from './games'

export interface GameDetailsState {
  /** `loading` until main first answers, `failed` when it can't. */
  status: 'loading' | 'ready' | 'failed'
  /** Null when the game isn't in the library, or until it is read. */
  game: GameDetails | null
}

const LOADING: GameDetailsState = { status: 'loading', game: null }

/**
 * What the library knows about the game `gameId`, read from main on mount and when it
 * changes, and again when the game ends, its play history having changed.
 */
export function useGameDetails(gameId: string): GameDetailsState {
  // Kept with the game it belongs to, so another game's details never show.
  const [read, setRead] = useState<{ gameId: string; state: GameDetailsState }>()

  useEffect(() => {
    let active = true
    const load = (): void => {
      getGameDetails(gameId).then(
        (game) => {
          if (active) setRead({ gameId, state: { status: 'ready', game } })
        },
        () => {
          if (active) setRead({ gameId, state: { status: 'failed', game: null } })
        }
      )
    }

    load()
    const unsubscribe = subscribeToGameEnded((ended) => {
      if (ended.gameId === gameId) load()
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [gameId])

  return read !== undefined && read.gameId === gameId ? read.state : LOADING
}
