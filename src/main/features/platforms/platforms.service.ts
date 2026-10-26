import type { CoreRef } from '@shared/api'

import { getDatabase } from '../../core/database'
import { isAmongCores, listInstalledPlatforms } from '../../core/installedPlatforms'
import { createPlatformSettingsRepository } from '../../core/platformSettings'

/** What the user sets for the installed platforms. */
export const platformsService = {
  /**
   * Keeps `core` as the one the games of the platform `platformId` play with, or forgets it
   * with null. Throws when `core` isn't one of the platform's installed cores.
   */
  async setDefaultCore(platformId: string, core: CoreRef | null): Promise<void> {
    if (core) {
      const platform = (await listInstalledPlatforms()).find(({ id }) => id === platformId)
      if (!platform || !isAmongCores(core, platform.cores)) {
        throw new Error(`The core ${core.coreId} doesn't play ${platformId}`)
      }
    }
    createPlatformSettingsRepository(getDatabase()).setDefaultCore(platformId, core, Date.now())
  }
}
