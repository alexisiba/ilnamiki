import { ipcRenderer } from 'electron'

import { NETWORK_CHANNELS, type NetworkApi } from '@shared/api'

export const networkApi: NetworkApi = {
  getStatus: () => ipcRenderer.invoke(NETWORK_CHANNELS.getStatus)
}
