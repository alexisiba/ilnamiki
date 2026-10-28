import { getDatabase } from '../database'
import { createEmulatorsRepository, findModule, installationOf } from '../emulators'
import type { ContentProvider, Identifier } from './gameMetadata.types'
import { createLibretroDatabase, type LibretroDatabaseFile } from './libretroDatabase'

/** The providers of each stage and kind, in the order they are asked. */
export interface MetadataProviders {
  identifiers: Identifier[]
  details: ContentProvider[]
}

/** The libretro databases every emulator of the user keeps, read live. */
async function listLibretroDatabases(): Promise<LibretroDatabaseFile[]> {
  const emulators = createEmulatorsRepository(getDatabase()).list()
  const databases = await Promise.all(
    emulators.map(async ({ kind, executablePath }) => {
      const module = findModule(kind)
      if (!module?.listGameDatabases) return []
      return module.listGameDatabases(installationOf(executablePath))
    })
  )
  return databases
    .flat()
    .filter(({ format }) => format === 'libretro-rdb')
    .map(({ platformId, name, path }) => ({ platformId, name, path }))
}

/**
 * The providers for one run over the library. They keep what they read (whole databases)
 * while they live, so each run makes its own and drops them when done.
 */
export function createMetadataProviders(): MetadataProviders {
  const libretroDatabase = createLibretroDatabase(listLibretroDatabases)
  return {
    identifiers: [libretroDatabase],
    details: [libretroDatabase]
  }
}
