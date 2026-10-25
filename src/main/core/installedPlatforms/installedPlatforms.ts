import type { InstalledPlatform } from '@shared/api'

import { getDatabase } from '../database'
import { createEmulatorsRepository } from '../emulators'
import { selectForPlatform } from '../platform'
import { groupByPlatform } from './installedPlatforms.grouping'
import { linuxCoresReader } from './providers/linux'
import { unsupportedCoresReader } from './providers/unsupported'

const reader = selectForPlatform({ linux: linuxCoresReader }, unsupportedCoresReader)

/**
 * The platforms the user's emulators play, by name, read live each time. RetroArch plays
 * those of its installed cores; the other emulators play none yet.
 */
export async function listInstalledPlatforms(): Promise<InstalledPlatform[]> {
  const emulators = createEmulatorsRepository(getDatabase())
    .list()
    .filter((emulator) => emulator.kind === 'retroarch')

  return groupByPlatform(
    await Promise.all(
      emulators.map(async (emulator) => ({
        emulatorId: emulator.id,
        cores: await reader.readRetroArchCores(emulator.executablePath)
      }))
    )
  )
}
