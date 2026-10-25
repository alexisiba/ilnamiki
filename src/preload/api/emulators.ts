import { ipcRenderer, type IpcRendererEvent } from 'electron'

import { EMULATORS_CHANNELS, type EmulatorClosed, type EmulatorsApi } from '@shared/api'

export const emulatorsApi: EmulatorsApi = {
  pickExecutable: () => ipcRenderer.invoke(EMULATORS_CHANNELS.pickExecutable),
  inspect: (executablePath) => ipcRenderer.invoke(EMULATORS_CHANNELS.inspect, executablePath),
  add: (request) => ipcRenderer.invoke(EMULATORS_CHANNELS.add, request),
  list: () => ipcRenderer.invoke(EMULATORS_CHANNELS.list),
  changePath: (request) => ipcRenderer.invoke(EMULATORS_CHANNELS.changePath, request),
  remove: (id) => ipcRenderer.invoke(EMULATORS_CHANNELS.remove, id),
  open: (id) => ipcRenderer.invoke(EMULATORS_CHANNELS.open, id),
  onClosed: (listener) => {
    const handle = (_event: IpcRendererEvent, closed: EmulatorClosed): void => listener(closed)
    ipcRenderer.on(EMULATORS_CHANNELS.closed, handle)
    return () => {
      ipcRenderer.removeListener(EMULATORS_CHANNELS.closed, handle)
    }
  }
}
