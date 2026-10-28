import type { ContentProvider, Identifier } from './gameMetadata.types'
import { createLibretroDatabase, type LibretroDatabaseFile } from './libretroDatabase'

/** The providers of each stage and kind, in the order they are asked. */
export interface MetadataProviders {
  identifiers: Identifier[]
  details: ContentProvider[]
}

/** What the providers need to look in, found by main before a run. */
export interface ProviderSources {
  /** The libretro databases the user's emulators keep. */
  libretroDatabases: LibretroDatabaseFile[]
}

/**
 * The providers for one run over the library, in order. They keep what they read (whole
 * databases) while they live, so each run makes its own and drops them when done. Runs in
 * the metadata worker: nothing here may need Electron or the app's database.
 */
export function createMetadataProviders({ libretroDatabases }: ProviderSources): MetadataProviders {
  const libretroDatabase = createLibretroDatabase(async () => libretroDatabases)
  return {
    identifiers: [libretroDatabase],
    details: [libretroDatabase]
  }
}
