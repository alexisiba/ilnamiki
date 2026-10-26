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

/** What it takes to play a platform's games: an emulator's application and the core to load. */
export interface PlatformPlayer {
  emulatorId: string
  /** Absolute path of the emulator's application. */
  executablePath: string
  /** Id of the core, e.g. "mupen64plus_next". */
  coreId: string
  /** Absolute path of the core's library. */
  coreLibraryPath: string
}

/**
 * How to play the platform `platformId`: with its first installed core, by name (the one
 * listed first), until the user can choose one. Null when no installed core plays it.
 */
export async function findPlatformPlayer(platformId: string): Promise<PlatformPlayer | null> {
  const platform = (await listInstalledPlatforms()).find(({ id }) => id === platformId)
  const core = platform?.cores[0]
  if (!core) return null

  const emulator = createEmulatorsRepository(getDatabase()).findById(core.emulatorId)
  if (!emulator) return null
  const coreLibraryPath = await reader.findRetroArchCoreLibrary(emulator.executablePath, core.id)
  if (coreLibraryPath === null) return null
  return {
    emulatorId: emulator.id,
    executablePath: emulator.executablePath,
    coreId: core.id,
    coreLibraryPath
  }
}
