import type { InstalledPlatform, PlatformEmulator } from '@shared/api'

import type { PlatformSettingsRecord } from '../platformSettings'
import { isAmongEmulators } from './installedPlatforms.choices'
import type { EmulatorOptions } from './installedPlatforms.types'

const compareNames = (a: string, b: string): number =>
  a.localeCompare(b, 'en', { sensitivity: 'base' })

/** By emulator name, then by option name; an emulator without options has none. */
const byEmulatorName = (a: PlatformEmulator, b: PlatformEmulator): number =>
  compareNames(a.emulatorName, b.emulatorName) ||
  compareNames(a.optionName ?? '', b.optionName ?? '')

/**
 * The platforms the emulators' options play, by name, each with the emulators that play it,
 * by `byEmulatorName`. A platform takes its name from the first option found for it, and its
 * manufacturer from the first that says. What the user set for it in `settings` applies: it is
 * on unless turned off, and its default emulator is the one chosen while it still plays it.
 */
export function groupByPlatform(
  emulators: EmulatorOptions[],
  settings: PlatformSettingsRecord[] = []
): InstalledPlatform[] {
  const platforms = new Map<string, InstalledPlatform>()
  for (const { emulatorId, emulatorName, options } of emulators) {
    for (const option of options) {
      const emulator: PlatformEmulator = {
        emulatorId,
        emulatorName,
        optionId: option.id,
        optionName: option.name,
        extensions: option.extensions
      }
      const platform = platforms.get(option.platform.id)
      if (!platform) {
        platforms.set(option.platform.id, {
          id: option.platform.id,
          name: option.platform.name,
          manufacturer: option.platform.manufacturer,
          emulators: [emulator],
          isEnabled: true,
          defaultEmulator: null
        })
        continue
      }
      platform.emulators.push(emulator)
      platform.manufacturer ??= option.platform.manufacturer
    }
  }

  for (const setting of settings) {
    const platform = platforms.get(setting.platformId)
    if (!platform) continue
    platform.isEnabled = setting.isEnabled
    if (setting.defaultEmulator && isAmongEmulators(setting.defaultEmulator, platform.emulators)) {
      platform.defaultEmulator = setting.defaultEmulator
    }
  }

  const sorted = [...platforms.values()].sort((a, b) => compareNames(a.name, b.name))
  for (const platform of sorted) platform.emulators.sort(byEmulatorName)
  return sorted
}
