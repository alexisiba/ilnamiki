import type { LastPlayedGame } from '@shared/api'

/** The game of the library played most recently, as last read from main. */
export interface LastPlayedGameState {
  /** `loading` until the first answer, `failed` when the last read failed. */
  status: 'loading' | 'ready' | 'failed'
  /** Null when no game was played; kept from the last successful read while a new one fails. */
  game: LastPlayedGame | null
}

const INITIAL_STATE: LastPlayedGameState = { status: 'loading', game: null }

let state = INITIAL_STATE
const listeners = new Set<() => void>()
let unsubscribeFromMain: (() => void) | null = null

function setState(next: LastPlayedGameState): void {
  state = next
  for (const listener of [...listeners]) listener()
}

/** Reads the last played game again, telling every subscriber. */
export async function refreshLastPlayedGame(): Promise<void> {
  try {
    setState({ status: 'ready', game: await window.api.games.getLastPlayed() })
  } catch {
    setState({ status: 'failed', game: state.game })
  }
}

/**
 * Calls `listener` whenever the last played game changes. The first subscriber after none
 * reads it again, and while any is subscribed it is read again each time a game ends, the
 * session it was just played in being recorded by then, and when its metadata is found.
 * Returns the unsubscribe function.
 */
export function subscribeToLastPlayedGame(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) {
    void refreshLastPlayedGame()
    const unsubscribeFromGameEnded = window.api.games.onGameEnded(() => {
      void refreshLastPlayedGame()
    })
    const unsubscribeFromMetadata = window.api.games.onMetadataChanged((changed) => {
      if (state.game && changed.gameIds.includes(state.game.id)) void refreshLastPlayedGame()
    })
    unsubscribeFromMain = () => {
      unsubscribeFromGameEnded()
      unsubscribeFromMetadata()
    }
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      unsubscribeFromMain?.()
      unsubscribeFromMain = null
    }
  }
}

export function getLastPlayedGameState(): LastPlayedGameState {
  return state
}

/** Forgets the last played game read, as when the app starts. For tests, between them. */
export function resetLastPlayedGame(): void {
  state = INITIAL_STATE
  listeners.clear()
  unsubscribeFromMain?.()
  unsubscribeFromMain = null
}
