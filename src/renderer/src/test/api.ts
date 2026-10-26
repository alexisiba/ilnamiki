import { vi } from 'vitest'

import type {
  AddEmulatorResult,
  AddFolderResult,
  FolderGame,
  GameDetails,
  GameFolder,
  GamePlayer,
  ChangeEmulatorPathResult,
  ControllerStatus,
  Emulator,
  InspectEmulatorResult,
  InstalledPlatform,
  LastPlayedGame,
  LaunchGameResult,
  LaunchRandomGameResult,
  NetworkStatus,
  OpenEmulatorResult,
  RecentlyAddedGame,
  RecentlyPlayedGame,
  ScanFolderResult,
  UpdateFolderResult
} from '@shared/api'

/**
 * Installs a fresh `window.api` (jsdom has no preload), where every request answers that
 * nothing is available. `setup.ts` calls it before each test.
 */
export function mockApi(): void {
  window.api = {
    controllers: {
      getStatus: vi.fn(async (): Promise<ControllerStatus[]> => [])
    },
    emulators: {
      pickExecutable: vi.fn(async (): Promise<string | null> => null),
      inspect: vi.fn(async (): Promise<InspectEmulatorResult> => ({
        ok: false,
        problem: 'not-found'
      })),
      add: vi.fn(async (): Promise<AddEmulatorResult> => ({ ok: false, problem: 'not-found' })),
      list: vi.fn(async (): Promise<Emulator[]> => []),
      changePath: vi.fn(async (): Promise<ChangeEmulatorPathResult> => ({
        ok: false,
        problem: 'unknown-emulator'
      })),
      remove: vi.fn(async (): Promise<void> => undefined),
      open: vi.fn(async (): Promise<OpenEmulatorResult> => ({
        ok: false,
        problem: 'unknown-emulator'
      })),
      onClosed: vi.fn((): (() => void) => () => undefined)
    },
    games: {
      getLastPlayed: vi.fn(async (): Promise<LastPlayedGame | null> => null),
      listRecentlyAdded: vi.fn(async (): Promise<RecentlyAddedGame[]> => []),
      listRecentlyPlayed: vi.fn(async (): Promise<RecentlyPlayedGame[]> => []),
      getDetails: vi.fn(async (): Promise<GameDetails | null> => null),
      getPlayer: vi.fn(async (): Promise<GamePlayer | null> => null),
      setCore: vi.fn(async (): Promise<void> => undefined),
      launch: vi.fn(async (): Promise<LaunchGameResult> => ({ ok: false, problem: 'no-core' })),
      launchRandom: vi.fn(async (): Promise<LaunchRandomGameResult> => ({
        ok: false,
        problem: 'no-games'
      })),
      onGameEnded: vi.fn((): (() => void) => () => undefined)
    },
    library: {
      pickFolder: vi.fn(async (): Promise<string | null> => null),
      scanFolder: vi.fn(async (): Promise<ScanFolderResult> => ({
        ok: false,
        problem: 'not-found'
      })),
      cancelScan: vi.fn(async (): Promise<void> => undefined),
      onScanProgress: vi.fn((): (() => void) => () => undefined),
      addFolder: vi.fn(async (): Promise<AddFolderResult> => ({
        ok: false,
        problem: 'unknown-scan'
      })),
      listFolders: vi.fn(async (): Promise<GameFolder[]> => []),
      listFolderGames: vi.fn(async (): Promise<FolderGame[]> => []),
      rescanFolder: vi.fn(async (): Promise<ScanFolderResult> => ({
        ok: false,
        problem: 'unknown-folder'
      })),
      updateFolder: vi.fn(async (): Promise<UpdateFolderResult> => ({
        ok: false,
        problem: 'unknown-scan'
      })),
      removeFolder: vi.fn(async (): Promise<void> => undefined)
    },
    network: {
      getStatus: vi.fn(async (): Promise<NetworkStatus> => ({
        connection: null,
        wifiSignalPercent: null,
        internet: null
      }))
    },
    platforms: {
      list: vi.fn(async (): Promise<InstalledPlatform[]> => []),
      setEnabled: vi.fn(async (): Promise<void> => undefined),
      setDefaultCore: vi.fn(async (): Promise<void> => undefined)
    }
  }
}

/** Makes `window.api.controllers.getStatus` resolve with `statuses`, or reject with an error. */
export function mockControllerStatus(statuses: ControllerStatus[] | Error): void {
  vi.mocked(window.api.controllers.getStatus).mockImplementation(async () => {
    if (statuses instanceof Error) throw statuses
    return statuses
  })
}

/**
 * Makes `window.api.emulators.pickExecutable` resolve with `path` (null when the user
 * cancels), or reject with an error.
 */
export function mockPickedExecutable(path: string | null | Error): void {
  vi.mocked(window.api.emulators.pickExecutable).mockImplementation(async () => {
    if (path instanceof Error) throw path
    return path
  })
}

/** Makes `window.api.emulators.list` resolve with `emulators`, or reject with an error. */
export function mockEmulators(emulators: Emulator[] | Error): void {
  vi.mocked(window.api.emulators.list).mockImplementation(async () => {
    if (emulators instanceof Error) throw emulators
    return emulators
  })
}

/** Makes `window.api.emulators.inspect` resolve with `result`. */
export function mockEmulatorInspection(result: InspectEmulatorResult): void {
  vi.mocked(window.api.emulators.inspect).mockResolvedValue(result)
}

/** Makes `window.api.emulators.add` resolve with `result`, or reject with an error. */
export function mockAddEmulator(result: AddEmulatorResult | Error): void {
  vi.mocked(window.api.emulators.add).mockImplementation(async () => {
    if (result instanceof Error) throw result
    return result
  })
}

/** Makes `window.api.emulators.changePath` resolve with `result`, or reject with an error. */
export function mockChangeEmulatorPath(result: ChangeEmulatorPathResult | Error): void {
  vi.mocked(window.api.emulators.changePath).mockImplementation(async () => {
    if (result instanceof Error) throw result
    return result
  })
}

/**
 * Makes `window.api.emulators.open` resolve with `result`, reject with an error, or, with
 * `'pending'`, never answer, as an emulator still starting.
 */
export function mockOpenEmulator(result: OpenEmulatorResult | Error | 'pending'): void {
  vi.mocked(window.api.emulators.open).mockImplementation(() => {
    if (result === 'pending') return new Promise(() => {})
    if (result instanceof Error) return Promise.reject(result)
    return Promise.resolve(result)
  })
}

/** Sends that the emulator `emulatorId` closed to every listener of `window.api.emulators.onClosed`. */
export function emitEmulatorClosed(emulatorId: string): void {
  for (const [listener] of vi.mocked(window.api.emulators.onClosed).mock.calls) {
    listener({ emulatorId })
  }
}

/**
 * Makes `window.api.library.pickFolder` resolve with `path` (null when the user cancels), or
 * reject with an error.
 */
export function mockPickedFolder(path: string | null | Error): void {
  vi.mocked(window.api.library.pickFolder).mockImplementation(async () => {
    if (path instanceof Error) throw path
    return path
  })
}

/**
 * Makes `window.api.library.scanFolder` resolve with `result`, reject with an error, or, with
 * `'pending'`, never answer, as a scan still running.
 */
export function mockScanFolder(result: ScanFolderResult | Error | 'pending'): void {
  vi.mocked(window.api.library.scanFolder).mockImplementation(() => {
    if (result === 'pending') return new Promise(() => {})
    if (result instanceof Error) return Promise.reject(result)
    return Promise.resolve(result)
  })
}

/** Sends `percent` to every listener of `window.api.library.onScanProgress`. */
export function emitScanProgress(percent: number): void {
  for (const [listener] of vi.mocked(window.api.library.onScanProgress).mock.calls) {
    listener({ percent })
  }
}

/** Makes `window.api.library.listFolders` resolve with `folders`, or reject with an error. */
export function mockGameFolders(folders: GameFolder[] | Error): void {
  vi.mocked(window.api.library.listFolders).mockImplementation(async () => {
    if (folders instanceof Error) throw folders
    return folders
  })
}

/** Makes `window.api.library.addFolder` resolve with `result`, or reject with an error. */
export function mockAddGameFolder(result: AddFolderResult | Error): void {
  vi.mocked(window.api.library.addFolder).mockImplementation(async () => {
    if (result instanceof Error) throw result
    return result
  })
}

/**
 * Makes `window.api.library.rescanFolder` resolve with `result`, reject with an error, or,
 * with `'pending'`, never answer, as a scan still running.
 */
export function mockRescanFolder(result: ScanFolderResult | Error | 'pending'): void {
  vi.mocked(window.api.library.rescanFolder).mockImplementation(() => {
    if (result === 'pending') return new Promise(() => {})
    if (result instanceof Error) return Promise.reject(result)
    return Promise.resolve(result)
  })
}

/** Makes `window.api.library.listFolderGames` resolve with `games`, or reject with an error. */
export function mockFolderGames(games: FolderGame[] | Error): void {
  vi.mocked(window.api.library.listFolderGames).mockImplementation(async () => {
    if (games instanceof Error) throw games
    return games
  })
}

/** Makes `window.api.library.updateFolder` resolve with `result`, or reject with an error. */
export function mockUpdateGameFolder(result: UpdateFolderResult | Error): void {
  vi.mocked(window.api.library.updateFolder).mockImplementation(async () => {
    if (result instanceof Error) throw result
    return result
  })
}

/**
 * Makes `window.api.games.launch` resolve with `result`, reject with an error, or, with
 * `'pending'`, never answer, as an emulator still starting.
 */
export function mockLaunchGame(result: LaunchGameResult | Error | 'pending'): void {
  vi.mocked(window.api.games.launch).mockImplementation(() => {
    if (result === 'pending') return new Promise(() => {})
    if (result instanceof Error) return Promise.reject(result)
    return Promise.resolve(result)
  })
}

/**
 * Makes `window.api.games.launchRandom` resolve with `result`, reject with an error, or, with
 * `'pending'`, never answer, as an emulator still starting.
 */
export function mockLaunchRandomGame(result: LaunchRandomGameResult | Error | 'pending'): void {
  vi.mocked(window.api.games.launchRandom).mockImplementation(() => {
    if (result === 'pending') return new Promise(() => {})
    if (result instanceof Error) return Promise.reject(result)
    return Promise.resolve(result)
  })
}

/** Sends that the game `gameId` ended to every listener of `window.api.games.onGameEnded`. */
export function emitGameEnded(gameId: string): void {
  for (const [listener] of vi.mocked(window.api.games.onGameEnded).mock.calls) {
    listener({ gameId })
  }
}

/**
 * Makes `window.api.games.getLastPlayed` resolve with `game` (null when none was played), or
 * reject with an error.
 */
export function mockLastPlayedGame(game: LastPlayedGame | null | Error): void {
  vi.mocked(window.api.games.getLastPlayed).mockImplementation(async () => {
    if (game instanceof Error) throw game
    return game
  })
}

/**
 * Makes `window.api.games.getDetails` resolve with `game` (null when it isn't in the library),
 * or reject with an error.
 */
export function mockGameDetails(game: GameDetails | null | Error): void {
  vi.mocked(window.api.games.getDetails).mockImplementation(async () => {
    if (game instanceof Error) throw game
    return game
  })
}

/**
 * Makes `window.api.games.getPlayer` resolve with `player` (null when the game isn't in the
 * library), or reject with an error.
 */
export function mockGamePlayer(player: GamePlayer | null | Error): void {
  vi.mocked(window.api.games.getPlayer).mockImplementation(async () => {
    if (player instanceof Error) throw player
    return player
  })
}

/** Makes `window.api.games.listRecentlyPlayed` resolve with `games`, or reject with an error. */
export function mockRecentlyPlayedGames(games: RecentlyPlayedGame[] | Error): void {
  vi.mocked(window.api.games.listRecentlyPlayed).mockImplementation(async () => {
    if (games instanceof Error) throw games
    return games
  })
}

/** Makes `window.api.games.listRecentlyAdded` resolve with `games`, or reject with an error. */
export function mockRecentlyAddedGames(games: RecentlyAddedGame[] | Error): void {
  vi.mocked(window.api.games.listRecentlyAdded).mockImplementation(async () => {
    if (games instanceof Error) throw games
    return games
  })
}

/** Makes `window.api.platforms.list` resolve with `platforms`, or reject with an error. */
export function mockPlatforms(platforms: InstalledPlatform[] | Error): void {
  vi.mocked(window.api.platforms.list).mockImplementation(async () => {
    if (platforms instanceof Error) throw platforms
    return platforms
  })
}

/**
 * Makes `window.api.network.getStatus` resolve with `status` (fields left out are null), or
 * reject with an error.
 */
export function mockNetworkStatus(status: Partial<NetworkStatus> | Error): void {
  vi.mocked(window.api.network.getStatus).mockImplementation(async () => {
    if (status instanceof Error) throw status
    return { connection: null, wifiSignalPercent: null, internet: null, ...status }
  })
}
