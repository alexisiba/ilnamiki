import { ipcRenderer } from 'electron'

import { EMULATORS_CHANNELS, type EmulatorsApi } from '@shared/api'

export const emulatorsApi: EmulatorsApi = {
  pickExecutable: () => ipcRenderer.invoke(EMULATORS_CHANNELS.pickExecutable),
  inspect: (executablePath) => ipcRenderer.invoke(EMULATORS_CHANNELS.inspect, executablePath),
  add: (request) => ipcRenderer.invoke(EMULATORS_CHANNELS.add, request),
  list: () => ipcRenderer.invoke(EMULATORS_CHANNELS.list),
  changePath: (request) => ipcRenderer.invoke(EMULATORS_CHANNELS.changePath, request),
  remove: (id) => ipcRenderer.invoke(EMULATORS_CHANNELS.remove, id)
}
