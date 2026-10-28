import type { RetroArchCoresReader } from '../retroarch.types'

/** Operating systems Ilnamiki can't read cores on yet find none. */
export const unsupportedCoresReader: RetroArchCoresReader = {
  readCores: async () => [],
  findCoreLibrary: async () => null,
  findDatabaseFolder: async () => null
}
