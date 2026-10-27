import type { InstalledPlatform } from '@shared/api'

/** How many of `platforms` the emulator `emulatorId` plays. */
export function countLinkedPlatforms(emulatorId: string, platforms: InstalledPlatform[]): number {
  return platforms.filter((platform) =>
    platform.emulators.some((emulator) => emulator.emulatorId === emulatorId)
  ).length
}
