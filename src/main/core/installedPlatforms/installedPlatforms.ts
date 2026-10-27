import type { EmulatorChoice, InstalledPlatform } from '@shared/api'

import { getDatabase } from '../database'
import {
  createEmulatorsRepository,
  type EmulatorStart,
  findModule,
  installationOf,
  prepareGameStart
} from '../emulators'
import { createPlatformSettingsRepository } from '../platformSettings'
import { groupByPlatform } from './installedPlatforms.grouping'
import type { EmulatorOptions } from './installedPlatforms.types'

/**
 * The platforms the user's emulators play, by name, read live each time, each on unless the
 * user turned it off. Each emulator Ilnamiki knows plays those of its options; one it doesn't
 * know plays none.
 */
export async function listInstalledPlatforms(): Promise<InstalledPlatform[]> {
  const db = getDatabase()
  const emulators = await Promise.all(
    createEmulatorsRepository(db)
      .list()
      .map(async (emulator): Promise<EmulatorOptions> => {
        const module = findModule(emulator.kind)
        return {
          emulatorId: emulator.id,
          emulatorName: emulator.name,
          options: module ? await module.listOptions(installationOf(emulator.executablePath)) : []
        }
      })
  )
  return groupByPlatform(emulators, createPlatformSettingsRepository(db).list())
}

/** What it takes to play a game: the emulator chosen and how to start it. */
export interface GameStart extends EmulatorStart {
  emulator: EmulatorChoice
}

/**
 * How to start the game at `gamePath` with `emulator`. Null when the emulator is gone, isn't
 * one Ilnamiki knows, or can't play with that option anymore.
 */
export async function prepareGame(
  emulator: EmulatorChoice,
  gamePath: string
): Promise<GameStart | null> {
  const record = createEmulatorsRepository(getDatabase()).findById(emulator.emulatorId)
  if (!record) return null
  const start = await prepareGameStart(record, { optionId: emulator.optionId, gamePath })
  return start && { ...start, emulator }
}
