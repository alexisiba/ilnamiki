import { ipcRenderer } from 'electron'

import { PLATFORMS_CHANNELS, type PlatformsApi } from '@shared/api'

export const platformsApi: PlatformsApi = {
  list: () => ipcRenderer.invoke(PLATFORMS_CHANNELS.list),
  setEnabled: (platformId, enabled) =>
    ipcRenderer.invoke(PLATFORMS_CHANNELS.setEnabled, platformId, enabled),
  setDefaultEmulator: (platformId, emulator) =>
    ipcRenderer.invoke(PLATFORMS_CHANNELS.setDefaultEmulator, platformId, emulator),
  getPhoto: (platformId) => ipcRenderer.invoke(PLATFORMS_CHANNELS.getPhoto, platformId)
}
