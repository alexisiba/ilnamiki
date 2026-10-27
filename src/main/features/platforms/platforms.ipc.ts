import { ipcMain } from 'electron'

import { PLATFORMS_CHANNELS } from '@shared/api'

import { getDatabase } from '../../core/database'
import { listInstalledPlatforms, parseEmulatorChoice } from '../../core/installedPlatforms'
import { createPlatformSettingsRepository } from '../../core/platformSettings'
import { platformsService } from './platforms.service'
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

  ipcMain.handle(PLATFORMS_CHANNELS.setDefaultEmulator, (_event, id: unknown, value: unknown) => {
    const platformId = parsePlatformId(id)
    const emulator = value === null ? null : parseEmulatorChoice(value)
    if (platformId === null || (value !== null && emulator === null)) {
      throw new Error('platforms.setDefaultEmulator needs a platform id and an emulator, or null')
    }
    return platformsService.setDefaultEmulator(platformId, emulator)
  })

  ipcMain.handle(PLATFORMS_CHANNELS.getPhoto, (_event, id: unknown) => {
    const platformId = parsePlatformId(id)
    if (platformId === null) throw new Error('platforms.getPhoto needs a platform id')
    return platformsService.getPhoto(platformId)
  })
}
