import type { CoreRef, InstalledPlatform } from '@shared/api'

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
 * Turns the platform `platformId` on or off in main, then shows it so to every subscriber,
 * without reading the platforms again. Rejects when main can't keep it, changing nothing.
 */
export async function setPlatformEnabled(platformId: string, enabled: boolean): Promise<void> {
  await window.api.platforms.setEnabled(platformId, enabled)
  setState({
    ...state,
    platforms: state.platforms.map((platform) =>
      platform.id === platformId ? { ...platform, isEnabled: enabled } : platform
    )
  })
}

/**
 * Keeps `core` in main as the one the games of the platform `platformId` play with (null
 * goes back to its first core), then shows it so to every subscriber, without reading the
 * platforms again. Rejects when main can't keep it, changing nothing.
 */
export async function setPlatformDefaultCore(
  platformId: string,
  core: CoreRef | null
): Promise<void> {
  await window.api.platforms.setDefaultCore(platformId, core)
  setState({
    ...state,
    platforms: state.platforms.map((platform) =>
      platform.id === platformId ? { ...platform, defaultCore: core } : platform
    )
  })
}

/** Photos of consoles already got from main this session, by platform id. */
const photos = new Map<string, string>()

/** The photo of the console of `platformId` if main already gave it this session. */
export function findPlatformPhoto(platformId: string): string | undefined {
  return photos.get(platformId)
}

/**
 * The photo of the console of `platformId` as a URL, asking main only the first time it has
 * one; null when main has none for it now, so it is asked again next time. Rejects when main
 * fails.
 */
export async function getPlatformPhoto(platformId: string): Promise<string | null> {
  const known = photos.get(platformId)
  if (known) return known
  const photo = await window.api.platforms.getPhoto(platformId)
  if (photo) photos.set(platformId, photo)
  return photo
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
  photos.clear()
}
