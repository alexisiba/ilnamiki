import type { InstalledPlatform } from '@shared/api'

import { getDatabase } from '../../core/database'
import { selectForPlatform } from '../../core/platform'
import { createEmulatorsRepository } from '../emulators/emulators.repository'
import { groupByPlatform } from './platforms.grouping'
import { linuxCoresReader } from './providers/linux'
import { unsupportedCoresReader } from './providers/unsupported'

const reader = selectForPlatform({ linux: linuxCoresReader }, unsupportedCoresReader)

/** The platforms the user's emulators play, read live from their installed cores. */
export const platformsService = {
  async list(): Promise<InstalledPlatform[]> {
    // Only RetroArch has cores for now; other emulators play no platform yet.
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
}
