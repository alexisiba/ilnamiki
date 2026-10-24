import type { ControllersApi } from './controllers'
import type { NetworkApi } from './network'

export * from './controllers'
export * from './network'

/**
 * Everything the main process exposes to the renderer on `window.api`, one key per domain
 * (see the `main-renderer-api` skill).
 */
export interface Api {
  controllers: ControllersApi
  network: NetworkApi
}
