import { BrowserWindow, ipcMain } from 'electron'

import { EMULATORS_CHANNELS } from '@shared/api'

import { pickPath } from '../../core/dialogs'
import { emulatorsService } from './emulators.service'
import {
  parseAddEmulatorRequest,
  parseChangeEmulatorPathRequest,
  parseEmulatorId,
  parseExecutablePath
} from './emulators.validation'

/** Answers the renderer's `emulators` requests, after checking what it sends. */
export function registerEmulatorsIpc(): void {
  // The picker opens over the window that asked for it.
  ipcMain.handle(EMULATORS_CHANNELS.pickExecutable, (event) =>
    pickPath(BrowserWindow.fromWebContents(event.sender), 'file')
  )

  ipcMain.handle(EMULATORS_CHANNELS.inspect, (_event, value: unknown) => {
    const executablePath = parseExecutablePath(value)
    if (executablePath === null) throw new Error('emulators.inspect needs an absolute path')
    return emulatorsService.inspect(executablePath)
  })

  ipcMain.handle(EMULATORS_CHANNELS.add, (_event, value: unknown) => {
    const request = parseAddEmulatorRequest(value)
    if (request === null) throw new Error('emulators.add got an invalid request')
    return emulatorsService.add(request)
  })

  ipcMain.handle(EMULATORS_CHANNELS.list, () => emulatorsService.list())

  ipcMain.handle(EMULATORS_CHANNELS.changePath, (_event, value: unknown) => {
    const request = parseChangeEmulatorPathRequest(value)
    if (request === null) throw new Error('emulators.changePath got an invalid request')
    return emulatorsService.changePath(request)
  })

  ipcMain.handle(EMULATORS_CHANNELS.remove, (_event, value: unknown) => {
    const id = parseEmulatorId(value)
    if (id === null) throw new Error('emulators.remove needs an emulator id')
    return emulatorsService.remove(id)
  })
}
