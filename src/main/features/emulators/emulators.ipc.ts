import { BrowserWindow, ipcMain } from 'electron'

import { EMULATORS_CHANNELS } from '@shared/api'

import { pickExecutable } from './emulators.dialogs'

/** Answers the renderer's `emulators` requests. */
export function registerEmulatorsIpc(): void {
  // The picker opens over the window that asked for it.
  ipcMain.handle(EMULATORS_CHANNELS.pickExecutable, (event) =>
    pickExecutable(BrowserWindow.fromWebContents(event.sender))
  )
}
