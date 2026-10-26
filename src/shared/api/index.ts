import type { ControllersApi } from './controllers'
import type { EmulatorsApi } from './emulators'
import type { GamesApi } from './games'
import type { LibraryApi } from './library'
import type { NetworkApi } from './network'
import type { PlatformsApi } from './platforms'

export * from './controllers'
export * from './emulators'
export * from './games'
export * from './library'
export * from './network'
export * from './platforms'

/**
 * Everything the main process exposes to the renderer on `window.api`, one key per domain
 * (see the `main-renderer-api` skill).
 */
export interface Api {
  controllers: ControllersApi
  emulators: EmulatorsApi
  games: GamesApi
  library: LibraryApi
  network: NetworkApi
  platforms: PlatformsApi
}
