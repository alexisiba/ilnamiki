import type { InstalledCore, InstalledPlatform } from '@shared/api'

import type { EmulatorCores } from './installedPlatforms.types'

const byName = (a: { name: string }, b: { name: string }): number =>
  a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })

/**
 * The platforms the emulators' cores play, each with its cores, both by name. A platform takes
 * its name from the first core found for it, and its manufacturer from the first that says;
 * it is on unless it is among `disabledPlatformIds`.
 */
export function groupByPlatform(
  emulators: EmulatorCores[],
  disabledPlatformIds: ReadonlySet<string> = new Set()
): InstalledPlatform[] {
  const platforms = new Map<string, InstalledPlatform>()
  for (const { emulatorId, cores } of emulators) {
    for (const detected of cores) {
      const { id, name, platformId, extensions } = detected
      const core: InstalledCore = { id, name, emulatorId, extensions }
      const platform = platforms.get(platformId)
      if (!platform) {
        platforms.set(platformId, {
          id: platformId,
          name: detected.platformName,
          manufacturer: detected.platformManufacturer,
          cores: [core],
          isEnabled: !disabledPlatformIds.has(platformId)
        })
        continue
      }
      platform.cores.push(core)
      platform.manufacturer ??= detected.platformManufacturer
    }
  }

  const sorted = [...platforms.values()].sort(byName)
  for (const platform of sorted) platform.cores.sort(byName)
  return sorted
}
