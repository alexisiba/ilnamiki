import { ipcMain } from 'electron'

import { PLATFORMS_CHANNELS } from '@shared/api'

import { getDatabase } from '../../core/database'
import { listInstalledPlatforms } from '../../core/installedPlatforms'
import { createPlatformSettingsRepository } from '../../core/platformSettings'
import { parsePlatformId } from './platforms.validation'

/** Answers the renderer's `platforms` requests, after checking what it sends. */
export function registerPlatformsIpc(): void {
  ipcMain.handle(PLATFORMS_CHANNELS.list, () => listInstalledPlatforms())

  ipcMain.handle(PLATFORMS_CHANNELS.setEnabled, (_event, id: unknown, enabled: unknown) => {
    const platformId = parsePlatformId(id)
    if (platformId === null || typeof enabled !== 'boolean') {
      throw new Error('platforms.setEnabled needs a platform id and whether it is on')
    }
    createPlatformSettingsRepository(getDatabase()).setEnabled(platformId, enabled, Date.now())
  })
}
