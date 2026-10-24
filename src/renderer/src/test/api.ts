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
    network: {
      getStatus: vi.fn(async (): Promise<NetworkStatus> => ({ connection: null }))
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

/** Makes `window.api.network.getStatus` resolve with `status`, or reject with an error. */
export function mockNetworkStatus(status: NetworkStatus | Error): void {
  vi.mocked(window.api.network.getStatus).mockImplementation(async () => {
    if (status instanceof Error) throw status
    return status
  })
}
