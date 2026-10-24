import { ipcMain } from 'electron'

import { NETWORK_CHANNELS } from '@shared/api'

import { networkService } from './network.service'

/** Answers the renderer's `network` requests. */
export function registerNetworkIpc(): void {
  ipcMain.handle(NETWORK_CHANNELS.getStatus, () => networkService.getStatus())
}
