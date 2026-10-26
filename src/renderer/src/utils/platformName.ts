import type { InstalledPlatform } from '@shared/api'

import { findCatalogPlatform } from './platformCatalog/platformCatalog'

/**
 * The console `platformId` as the app's catalog names it, or as its cores do when the catalog
 * doesn't know it, or its id when no emulator plays it anymore.
 */
export function getPlatformName(platformId: string, platforms: InstalledPlatform[]): string {
  const installed = platforms.find((platform) => platform.id === platformId)
  return findCatalogPlatform(platformId)?.name ?? installed?.name ?? platformId
}
