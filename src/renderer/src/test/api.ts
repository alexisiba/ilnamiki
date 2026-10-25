import { vi } from 'vitest'

import type { ControllerStatus, NetworkStatus } from '@shared/api'

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
      pickExecutable: vi.fn(async (): Promise<string | null> => null)
    },
    network: {
      getStatus: vi.fn(async (): Promise<NetworkStatus> => ({
        connection: null,
        wifiSignalPercent: null,
        internet: null
      }))
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
