import { ipcMain } from 'electron'

import { PLATFORMS_CHANNELS } from '@shared/api'

import { platformsService } from './platforms.service'

/** Answers the renderer's `platforms` requests. */
export function registerPlatformsIpc(): void {
  ipcMain.handle(PLATFORMS_CHANNELS.list, () => platformsService.list())
}
