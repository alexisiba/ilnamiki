import type { InstalledPlatform } from '@shared/api'

/** How many of `platforms` the emulator `emulatorId` plays, with one of its cores at least. */
export function countLinkedPlatforms(emulatorId: string, platforms: InstalledPlatform[]): number {
  return platforms.filter((platform) =>
    platform.cores.some((core) => core.emulatorId === emulatorId)
  ).length
}
