import type { InstalledPlatform } from '@renderer/types/installedPlatform'

/**
 * Every extension the cores of `platform` play, once each, in the order they declare them;
 * empty when none declares any.
 */
export function getPlatformExtensions(platform: InstalledPlatform): string[] {
  return [...new Set(platform.cores.flatMap((core) => core.extensions))]
}
