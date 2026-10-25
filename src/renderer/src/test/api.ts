import { vi } from 'vitest'

import type {
  AddEmulatorResult,
  AddFolderResult,
  GameFolder,
  ChangeEmulatorPathResult,
  ControllerStatus,
  Emulator,
  InspectEmulatorResult,
  InstalledPlatform,
  NetworkStatus,
  ScanFolderResult
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
      remove: vi.fn(async (): Promise<void> => undefined)
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
      listFolders: vi.fn(async (): Promise<GameFolder[]> => [])
    },
    network: {
      getStatus: vi.fn(async (): Promise<NetworkStatus> => ({
        connection: null,
        wifiSignalPercent: null,
        internet: null
      }))
    },
    platforms: {
      list: vi.fn(async (): Promise<InstalledPlatform[]> => [])
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
 * Makes `window.api.library.pickFolder` resolve with `path` (null when the user cancels), or
 * reject with an error.
 */
export function mockPickedFolder(path: string | null | Error): void {
  vi.mocked(window.api.library.pickFolder).mockImplementation(async () => {
    if (path instanceof Error) throw path
    return path
  })
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
