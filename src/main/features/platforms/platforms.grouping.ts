import type { InstalledCore, InstalledPlatform } from '@shared/api'

import type { EmulatorCores } from './platforms.types'

const byName = (a: { name: string }, b: { name: string }): number =>
  a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })

/**
 * The platforms the emulators' cores play, each with its cores, both by name. A platform takes
 * its name from the first core found for it.
 */
export function groupByPlatform(emulators: EmulatorCores[]): InstalledPlatform[] {
  const platforms = new Map<string, InstalledPlatform>()
  for (const { emulatorId, cores } of emulators) {
    for (const { id, name, platformId, platformName, extensions } of cores) {
      const core: InstalledCore = { id, name, emulatorId, extensions }
      const platform = platforms.get(platformId)
      if (platform) platform.cores.push(core)
      else platforms.set(platformId, { id: platformId, name: platformName, cores: [core] })
    }
  }

  const sorted = [...platforms.values()].sort(byName)
  for (const platform of sorted) platform.cores.sort(byName)
  return sorted
}
