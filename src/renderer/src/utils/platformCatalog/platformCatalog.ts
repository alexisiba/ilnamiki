import catalog from './platforms.json'

/** What the app knows about a platform, until its metadata comes from a database. */
export interface CatalogPlatform {
  /** Name shown in the app, e.g. "NES" rather than what a core calls it. */
  name: string
  /** Company that made it, e.g. "Nintendo"; null when not known. */
  manufacturer: string | null
  /** Year it was first released anywhere; null when not known. */
  releaseYear: number | null
}

const ENTRIES: Record<string, CatalogPlatform> = catalog

/** What the catalog says about the platform `platformId` (e.g. "nintendo_64"), if anything. */
export function findCatalogPlatform(platformId: string): CatalogPlatform | undefined {
  return ENTRIES[platformId]
}
