import { ipcMain } from 'electron'

import { CONTROLLERS_CHANNELS } from '@shared/api'

import { controllersService } from './controllers.service'

/** Answers the renderer's `controllers` requests. */
export function registerControllersIpc(): void {
  ipcMain.handle(CONTROLLERS_CHANNELS.getStatus, () => controllersService.getStatus())
}
