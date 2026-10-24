import type { ControllersApi } from '@shared/api'

/** Platforms Ilnamiki can't read controllers on yet report none. */
export const unsupportedControllersProvider: ControllersApi = {
  getStatus: async () => []
}
