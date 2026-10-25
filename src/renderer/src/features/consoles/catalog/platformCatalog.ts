import catalog from './platforms.json'

/** What the app knows about a platform, until its metadata comes from a database. */
export interface CatalogPlatform {
  /** Name shown in the app, e.g. "NES" rather than what a core calls it. */
  name: string
  /** Company that made it, e.g. "Nintendo"; null when not known. */
  manufacturer: string | null
  /** Year it was first released anywhere; null when not known. */
  releaseYear: number | null
  /** Render of the console that ships with the app; null when there is none. */
  imageUrl: string | null
}

interface CatalogEntry {
  name: string
  manufacturer: string | null
  releaseYear: number | null
  /** Name of the render in `assets/images/consoles`, without its extension. */
  image?: string
}

const ENTRIES: Record<string, CatalogEntry> = catalog

/** The console renders that ship with the app, by file name without the extension. */
const IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>('../../../assets/images/consoles/*.webp', {
      eager: true,
      import: 'default'
    })
  ).map(([path, url]) => [path.slice(path.lastIndexOf('/') + 1, -'.webp'.length), url])
)

/** What the catalog says about the platform `platformId` (e.g. "nintendo_64"), if anything. */
export function findCatalogPlatform(platformId: string): CatalogPlatform | undefined {
  const entry = ENTRIES[platformId]
  if (!entry) return undefined
  return {
    name: entry.name,
    manufacturer: entry.manufacturer,
    releaseYear: entry.releaseYear,
    imageUrl: (entry.image && IMAGES[entry.image]) || null
  }
}
