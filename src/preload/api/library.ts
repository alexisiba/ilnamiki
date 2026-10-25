import { ipcRenderer } from 'electron'

import { LIBRARY_CHANNELS, type LibraryApi } from '@shared/api'

export const libraryApi: LibraryApi = {
  pickFolder: () => ipcRenderer.invoke(LIBRARY_CHANNELS.pickFolder)
}
