import { ipcRenderer, type IpcRendererEvent } from 'electron'

import { LIBRARY_CHANNELS, type LibraryApi, type ScanProgress } from '@shared/api'

export const libraryApi: LibraryApi = {
  pickFolder: () => ipcRenderer.invoke(LIBRARY_CHANNELS.pickFolder),
  scanFolder: (request) => ipcRenderer.invoke(LIBRARY_CHANNELS.scanFolder, request),
  cancelScan: () => ipcRenderer.invoke(LIBRARY_CHANNELS.cancelScan),
  onScanProgress: (listener) => {
    const handle = (_event: IpcRendererEvent, progress: ScanProgress): void => listener(progress)
    ipcRenderer.on(LIBRARY_CHANNELS.scanProgress, handle)
    return () => {
      ipcRenderer.removeListener(LIBRARY_CHANNELS.scanProgress, handle)
    }
  }
}
