import type { InstalledCore, InstalledPlatform } from '@shared/api'

import type { PlatformSettingsRecord } from '../platformSettings'
import { isAmongCores } from './installedPlatforms.cores'
import type { EmulatorCores } from './installedPlatforms.types'

const byName = (a: { name: string }, b: { name: string }): number =>
  a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })

/**
 * The platforms the emulators' cores play, each with its cores, both by name. A platform takes
 * its name from the first core found for it, and its manufacturer from the first that says.
 * What the user set for it in `settings` applies: it is on unless turned off, and its default
 * core is the one chosen while that core is still among its cores.
 */
export function groupByPlatform(
  emulators: EmulatorCores[],
  settings: PlatformSettingsRecord[] = []
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
          isEnabled: true,
          defaultCore: null
        })
        continue
      }
      platform.cores.push(core)
      platform.manufacturer ??= detected.platformManufacturer
    }
  }

  for (const setting of settings) {
    const platform = platforms.get(setting.platformId)
    if (!platform) continue
    platform.isEnabled = setting.isEnabled
    if (setting.defaultCore && isAmongCores(setting.defaultCore, platform.cores)) {
      platform.defaultCore = setting.defaultCore
    }
  }

  const sorted = [...platforms.values()].sort(byName)
  for (const platform of sorted) platform.cores.sort(byName)
  return sorted
}
