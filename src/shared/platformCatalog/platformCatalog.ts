import catalog from './platforms.json'

/**
 * What the app knows about a platform, until its metadata comes from a database. Platforms are
 * keyed by RetroArch's `systemid`, so the same console is one platform whatever emulator plays
 * it; a platform RetroArch doesn't play gets an id in the same style (e.g. "switch").
 */
export interface CatalogPlatform {
  /** Name shown in the app, e.g. "NES" rather than what an emulator calls it. */
  name: string
  /** Company that made it, e.g. "Nintendo"; null when not known. */
  manufacturer: string | null
  /** Year it was first released anywhere; null when not known. */
  releaseYear: number | null
}

/** A platform as the catalog file writes it. */
interface CatalogEntry extends CatalogPlatform {
  /**
   * Extensions an emulator of the platform opens that are never games (e.g. homebrew
   * executables or sound files), lowercase and without the dot; absent when there are none.
   */
  ignoredExtensions?: string[]
}

/** Id of a platform in the catalog, e.g. "nintendo_64". */
export type CatalogPlatformId = keyof typeof catalog

const ENTRIES: Record<string, CatalogEntry> = catalog

const toPlatform = ({ name, manufacturer, releaseYear }: CatalogEntry): CatalogPlatform => ({
  name,
  manufacturer,
  releaseYear
})

/** What the catalog says about the platform `platformId` (e.g. "nintendo_64"), if anything. */
export function findCatalogPlatform(platformId: string): CatalogPlatform | undefined {
  const entry = ENTRIES[platformId]
  return entry && toPlatform(entry)
}

/** What the catalog says about `platformId`, one of its own platforms. */
export function getCatalogPlatform(platformId: CatalogPlatformId): CatalogPlatform {
  return toPlatform(ENTRIES[platformId])
}

/** The extensions of `platformId` that are never games; empty when it has none. */
export function ignoredExtensionsOf(platformId: string): string[] {
  return ENTRIES[platformId]?.ignoredExtensions ?? []
}
