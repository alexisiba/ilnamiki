import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Api } from '@shared/api'

import { controllersApi } from './api/controllers'
import { emulatorsApi } from './api/emulators'
import { gamesApi } from './api/games'
import { libraryApi } from './api/library'
import { networkApi } from './api/network'
import { platformsApi } from './api/platforms'

// Custom APIs for renderer
const api: Api = {
  controllers: controllersApi,
  emulators: emulatorsApi,
  games: gamesApi,
  library: libraryApi,
  network: networkApi,
  platforms: platformsApi
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
