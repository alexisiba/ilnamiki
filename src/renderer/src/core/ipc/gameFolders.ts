import type { AddFolderResult, GameFolder } from '@shared/api'

/** The game folders shown across the app, as last read from main. */
export interface GameFoldersState {
  /** `loading` until the first answer, `failed` when the last read failed. */
  status: 'loading' | 'ready' | 'failed'
  /** Oldest first; kept from the last successful read while a new one fails. */
  folders: GameFolder[]
}

const INITIAL_STATE: GameFoldersState = { status: 'loading', folders: [] }

let state = INITIAL_STATE
const listeners = new Set<() => void>()

function setState(next: GameFoldersState): void {
  state = next
  for (const listener of [...listeners]) listener()
}

/** Reads the game folders again, telling every subscriber. */
export async function refreshGameFolders(): Promise<void> {
  try {
    setState({ status: 'ready', folders: await window.api.library.listFolders() })
  } catch {
    setState({ status: 'failed', folders: state.folders })
  }
}

/** Adds the folder of the latest scan; once added, the game folders are read again. */
export async function addGameFolder(scanId: string): Promise<AddFolderResult> {
  const result = await window.api.library.addFolder(scanId)
  if (result.ok) await refreshGameFolders()
  return result
}

/**
 * Calls `listener` whenever the game folders change. The first subscriber after none reads
 * them again, so a screen that opens shows them fresh (e.g. whether each folder is still
 * there). Returns the unsubscribe function.
 */
export function subscribeToGameFolders(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) void refreshGameFolders()
  return () => {
    listeners.delete(listener)
  }
}

export function getGameFoldersState(): GameFoldersState {
  return state
}

/** Forgets the game folders read, as when the app starts. For tests, between them. */
export function resetGameFolders(): void {
  state = INITIAL_STATE
  listeners.clear()
}
