import { ipcRenderer, type IpcRendererEvent } from 'electron'

import { GAMES_CHANNELS, type GameEnded, type GamesApi } from '@shared/api'

export const gamesApi: GamesApi = {
  getLastPlayed: () => ipcRenderer.invoke(GAMES_CHANNELS.getLastPlayed),
  listRecentlyAdded: () => ipcRenderer.invoke(GAMES_CHANNELS.listRecentlyAdded),
  getDetails: (gameId) => ipcRenderer.invoke(GAMES_CHANNELS.getDetails, gameId),
  launch: (gameId) => ipcRenderer.invoke(GAMES_CHANNELS.launch, gameId),
  launchRandom: () => ipcRenderer.invoke(GAMES_CHANNELS.launchRandom),
  onGameEnded: (listener) => {
    const handle = (_event: IpcRendererEvent, ended: GameEnded): void => listener(ended)
    ipcRenderer.on(GAMES_CHANNELS.gameEnded, handle)
    return () => {
      ipcRenderer.removeListener(GAMES_CHANNELS.gameEnded, handle)
    }
  }
}
