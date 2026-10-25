import type { CoresReader } from '../platforms.types'

/** Operating systems Ilnamiki can't read cores on yet find none. */
export const unsupportedCoresReader: CoresReader = {
  readRetroArchCores: async () => []
}
