import { ipcRenderer } from 'electron'

import { CONTROLLERS_CHANNELS, type ControllersApi } from '@shared/api'

export const controllersApi: ControllersApi = {
  getStatus: () => ipcRenderer.invoke(CONTROLLERS_CHANNELS.getStatus)
}
