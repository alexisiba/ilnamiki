import { ipcRenderer } from 'electron'

import { PLATFORMS_CHANNELS, type PlatformsApi } from '@shared/api'

export const platformsApi: PlatformsApi = {
  list: () => ipcRenderer.invoke(PLATFORMS_CHANNELS.list)
}
