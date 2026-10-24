import type { ControllersApi } from './controllers'

export * from './controllers'

/**
 * Everything the main process exposes to the renderer on `window.api`, one key per domain
 * (see the `main-renderer-api` skill).
 */
export interface Api {
  controllers: ControllersApi
}
