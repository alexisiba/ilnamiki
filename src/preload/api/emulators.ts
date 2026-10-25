import { ipcRenderer } from 'electron'

import { EMULATORS_CHANNELS, type EmulatorsApi } from '@shared/api'

export const emulatorsApi: EmulatorsApi = {
  pickExecutable: () => ipcRenderer.invoke(EMULATORS_CHANNELS.pickExecutable)
}
