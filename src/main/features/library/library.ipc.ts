import { BrowserWindow, ipcMain } from 'electron'

import { LIBRARY_CHANNELS } from '@shared/api'

import { pickPath } from '../../core/dialogs'

/** Answers the renderer's `library` requests. */
export function registerLibraryIpc(): void {
  // The picker opens over the window that asked for it.
  ipcMain.handle(LIBRARY_CHANNELS.pickFolder, (event) =>
    pickPath(BrowserWindow.fromWebContents(event.sender), 'directory')
  )
}
