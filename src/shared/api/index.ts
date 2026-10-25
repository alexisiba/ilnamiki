import type { ControllersApi } from './controllers'
import type { EmulatorsApi } from './emulators'
import type { LibraryApi } from './library'
import type { NetworkApi } from './network'

export * from './controllers'
export * from './emulators'
export * from './library'
export * from './network'

/**
 * Everything the main process exposes to the renderer on `window.api`, one key per domain
 * (see the `main-renderer-api` skill).
 */
export interface Api {
  controllers: ControllersApi
  emulators: EmulatorsApi
  library: LibraryApi
  network: NetworkApi
}
