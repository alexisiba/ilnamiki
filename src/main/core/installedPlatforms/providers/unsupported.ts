import type { CoresReader } from '../installedPlatforms.types'

/** Operating systems Ilnamiki can't read cores on yet find none. */
export const unsupportedCoresReader: CoresReader = {
  readRetroArchCores: async () => []
}
