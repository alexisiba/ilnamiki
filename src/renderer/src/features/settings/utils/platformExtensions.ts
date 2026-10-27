import type { InstalledPlatform } from '@renderer/types/installedPlatform'

/**
 * Every extension the emulators of `platform` play, once each, in the order they declare them;
 * empty when none declares any.
 */
export function getPlatformExtensions(platform: InstalledPlatform): string[] {
  return [...new Set(platform.emulators.flatMap((emulator) => emulator.extensions))]
}
