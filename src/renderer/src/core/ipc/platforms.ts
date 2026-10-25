import type { InstalledPlatform } from '@shared/api'

/** The installed platforms shown across the app, as last read from main. */
export interface PlatformsState {
  /** `loading` until the first answer, `failed` when the last read failed. */
  status: 'loading' | 'ready' | 'failed'
  /** By name; kept from the last successful read while a new one fails. */
  platforms: InstalledPlatform[]
}

const INITIAL_STATE: PlatformsState = { status: 'loading', platforms: [] }

let state = INITIAL_STATE
const listeners = new Set<() => void>()

function setState(next: PlatformsState): void {
  state = next
  for (const listener of [...listeners]) listener()
}

/** Reads the installed platforms again, telling every subscriber. */
export async function refreshPlatforms(): Promise<void> {
  try {
    setState({ status: 'ready', platforms: await window.api.platforms.list() })
  } catch {
    setState({ status: 'failed', platforms: state.platforms })
  }
}

/**
 * Calls `listener` whenever the installed platforms change. The first subscriber after none
 * reads them again, so a screen that opens shows them fresh (e.g. after installing a core in
 * the emulator). Returns the unsubscribe function.
 */
export function subscribeToPlatforms(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) void refreshPlatforms()
  return () => {
    listeners.delete(listener)
  }
}

export function getPlatformsState(): PlatformsState {
  return state
}

/** Forgets the platforms read, as when the app starts. For tests, between them. */
export function resetPlatforms(): void {
  state = INITIAL_STATE
  listeners.clear()
}
