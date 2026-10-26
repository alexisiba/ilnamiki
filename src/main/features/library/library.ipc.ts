import { BrowserWindow, ipcMain, type IpcMainInvokeEvent } from 'electron'

import { LIBRARY_CHANNELS } from '@shared/api'

import { pickPath } from '../../core/dialogs'
import { createProgressReporter } from './library.progress'
import { libraryService } from './library.service'
import {
  parseFolderId,
  parseFolderPath,
  parseScanFolderRequest,
  parseScanId
} from './library.validation'

/** Answers the renderer's `library` requests, after checking what it sends. */
export function registerLibraryIpc(): void {
  // The picker opens over the window that asked for it.
  ipcMain.handle(LIBRARY_CHANNELS.pickFolder, (event) =>
    pickPath(BrowserWindow.fromWebContents(event.sender), 'directory')
  )

  // The progress goes to the window that asked for the scan.
  const progressReporterFor = (event: IpcMainInvokeEvent): ((fraction: number) => void) =>
    createProgressReporter((progress) => {
      if (!event.sender.isDestroyed()) event.sender.send(LIBRARY_CHANNELS.scanProgress, progress)
    })

  ipcMain.handle(LIBRARY_CHANNELS.scanFolder, (event, value: unknown) => {
    const request = parseScanFolderRequest(value)
    if (request === null) throw new Error('library.scanFolder got an invalid request')
    return libraryService.scanFolder(request, progressReporterFor(event))
  })

  ipcMain.handle(LIBRARY_CHANNELS.rescanFolder, (event, value: unknown, pathValue: unknown) => {
    const folderId = parseFolderId(value)
    if (folderId === null) throw new Error('library.rescanFolder needs a folder id')
    const path = pathValue === undefined ? undefined : parseFolderPath(pathValue)
    if (path === null) throw new Error('library.rescanFolder got an invalid path')
    return libraryService.rescanFolder(folderId, path, progressReporterFor(event))
  })

  ipcMain.handle(LIBRARY_CHANNELS.cancelScan, () => libraryService.cancelScan())

  ipcMain.handle(LIBRARY_CHANNELS.addFolder, (_event, value: unknown) => {
    const scanId = parseScanId(value)
    if (scanId === null) throw new Error('library.addFolder needs a scan id')
    return libraryService.addFolder(scanId)
  })

  ipcMain.handle(LIBRARY_CHANNELS.updateFolder, (_event, value: unknown) => {
    const scanId = parseScanId(value)
    if (scanId === null) throw new Error('library.updateFolder needs a scan id')
    return libraryService.updateFolder(scanId)
  })

  ipcMain.handle(LIBRARY_CHANNELS.removeFolder, (_event, value: unknown) => {
    const folderId = parseFolderId(value)
    if (folderId === null) throw new Error('library.removeFolder needs a folder id')
    return libraryService.removeFolder(folderId)
  })

  ipcMain.handle(LIBRARY_CHANNELS.listFolders, () => libraryService.listFolders())

  ipcMain.handle(LIBRARY_CHANNELS.listFolderGames, (_event, value: unknown) => {
    const folderId = parseFolderId(value)
    if (folderId === null) throw new Error('library.listFolderGames needs a folder id')
    return libraryService.listFolderGames(folderId)
  })
}
