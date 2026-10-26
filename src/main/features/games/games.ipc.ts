import { BrowserWindow, ipcMain } from 'electron'

import { GAMES_CHANNELS, type GameEnded } from '@shared/api'

import { bringBack } from '../../core/emulatorProcess'
import { gamesService } from './games.service'
import { parseGameId } from './games.validation'

/** Answers the renderer's `games` requests, after checking what it sends. */
export function registerGamesIpc(): void {
  ipcMain.handle(GAMES_CHANNELS.getLastPlayed, () => gamesService.getLastPlayed())
  ipcMain.handle(GAMES_CHANNELS.listRecentlyAdded, () => gamesService.listRecentlyAdded())

  // An id that can't be a game's (e.g. typed in a path) names no game of the library.
  ipcMain.handle(GAMES_CHANNELS.getDetails, (_event, value: unknown) => {
    const gameId = parseGameId(value)
    return gameId === null ? null : gamesService.getDetails(gameId)
  })

  // The end goes to the window that started the game, which comes back in front.
  ipcMain.handle(GAMES_CHANNELS.launch, (event, value: unknown) => {
    const gameId = parseGameId(value)
    if (gameId === null) throw new Error('games.launch needs a game id')

    const window = BrowserWindow.fromWebContents(event.sender)
    return gamesService.launch(gameId, () => {
      bringBack(window)
      const ended: GameEnded = { gameId }
      if (!event.sender.isDestroyed()) event.sender.send(GAMES_CHANNELS.gameEnded, ended)
    })
  })
}
