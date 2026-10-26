import { BrowserWindow, ipcMain, type IpcMainInvokeEvent } from 'electron'

import { GAMES_CHANNELS, type GameEnded } from '@shared/api'

import { bringBack } from '../../core/emulatorProcess'
import { gamesService } from './games.service'
import { parseGameId } from './games.validation'

/**
 * What happens when a game the window of `event` started ends: the window comes back in
 * front and is told which game ended.
 */
function endIn(event: IpcMainInvokeEvent): (gameId: string) => void {
  const window = BrowserWindow.fromWebContents(event.sender)
  return (gameId) => {
    bringBack(window)
    const ended: GameEnded = { gameId }
    if (!event.sender.isDestroyed()) event.sender.send(GAMES_CHANNELS.gameEnded, ended)
  }
}

/** Answers the renderer's `games` requests, after checking what it sends. */
export function registerGamesIpc(): void {
  ipcMain.handle(GAMES_CHANNELS.getLastPlayed, () => gamesService.getLastPlayed())
  ipcMain.handle(GAMES_CHANNELS.listRecentlyAdded, () => gamesService.listRecentlyAdded())

  // An id that can't be a game's (e.g. typed in a path) names no game of the library.
  ipcMain.handle(GAMES_CHANNELS.getDetails, (_event, value: unknown) => {
    const gameId = parseGameId(value)
    return gameId === null ? null : gamesService.getDetails(gameId)
  })

  ipcMain.handle(GAMES_CHANNELS.launch, (event, value: unknown) => {
    const gameId = parseGameId(value)
    if (gameId === null) throw new Error('games.launch needs a game id')

    const end = endIn(event)
    return gamesService.launch(gameId, () => end(gameId))
  })

  ipcMain.handle(GAMES_CHANNELS.launchRandom, (event) => gamesService.launchRandom(endIn(event)))
}
