import { BrowserWindow, ipcMain } from 'electron'

import { LIBRARY_CHANNELS } from '@shared/api'

import { pickPath } from '../../core/dialogs'
import { createProgressReporter } from './library.progress'
import { libraryService } from './library.service'
import { parseScanFolderRequest, parseScanId } from './library.validation'

/** Answers the renderer's `library` requests, after checking what it sends. */
export function registerLibraryIpc(): void {
  // The picker opens over the window that asked for it.
  ipcMain.handle(LIBRARY_CHANNELS.pickFolder, (event) =>
    pickPath(BrowserWindow.fromWebContents(event.sender), 'directory')
  )

  // The progress goes to the window that asked for the scan.
  ipcMain.handle(LIBRARY_CHANNELS.scanFolder, (event, value: unknown) => {
    const request = parseScanFolderRequest(value)
    if (request === null) throw new Error('library.scanFolder got an invalid request')

    const reportProgress = createProgressReporter((progress) => {
      if (!event.sender.isDestroyed()) event.sender.send(LIBRARY_CHANNELS.scanProgress, progress)
    })
    return libraryService.scanFolder(request, reportProgress)
  })

  ipcMain.handle(LIBRARY_CHANNELS.cancelScan, () => libraryService.cancelScan())

  ipcMain.handle(LIBRARY_CHANNELS.addFolder, (_event, value: unknown) => {
    const scanId = parseScanId(value)
    if (scanId === null) throw new Error('library.addFolder needs a scan id')
    return libraryService.addFolder(scanId)
  })

  ipcMain.handle(LIBRARY_CHANNELS.listFolders, () => libraryService.listFolders())
}
