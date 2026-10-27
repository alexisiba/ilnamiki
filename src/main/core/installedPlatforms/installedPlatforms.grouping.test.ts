import { describe, expect, it } from 'vitest'

import type { EmulatorOption } from '../emulators'
import { groupByPlatform } from './installedPlatforms.grouping'
import type { EmulatorOptions } from './installedPlatforms.types'

const SUPER_NES = { id: 'super_nes', name: 'Super Nintendo', manufacturer: 'Nintendo' }

const SNES9X: EmulatorOption = {
  id: 'snes9x',
  name: 'Snes9x',
  platform: SUPER_NES,
  extensions: ['smc', 'sfc']
}
const BSNES: EmulatorOption = { ...SNES9X, id: 'bsnes', name: 'bsnes', extensions: ['sfc', 'bs'] }
const MUPEN: EmulatorOption = {
  id: 'mupen64plus_next',
  name: 'Mupen64Plus-Next',
  platform: { id: 'nintendo_64', name: 'Nintendo 64', manufacturer: 'Nintendo' },
  extensions: ['n64']
}

const retroArch = (...options: EmulatorOption[]): EmulatorOptions => ({
  emulatorId: 'retroarch',
  emulatorName: 'RetroArch',
  options
})

describe('groupByPlatform', () => {
  it('lists no platforms without options', () => {
    expect(groupByPlatform([])).toEqual([])
    expect(groupByPlatform([retroArch()])).toEqual([])
  })

  it('makes each platform one entry with every emulator that plays it, by option name', () => {
    const platforms = groupByPlatform([retroArch(SNES9X, BSNES)])

    expect(platforms).toEqual([
      {
        id: 'super_nes',
        name: 'Super Nintendo',
        manufacturer: 'Nintendo',
        emulators: [
          {
            emulatorId: 'retroarch',
            emulatorName: 'RetroArch',
            optionId: 'bsnes',
            optionName: 'bsnes',
            extensions: ['sfc', 'bs']
          },
          {
            emulatorId: 'retroarch',
            emulatorName: 'RetroArch',
            optionId: 'snes9x',
            optionName: 'Snes9x',
            extensions: ['smc', 'sfc']
          }
        ],
        isEnabled: true,
        defaultEmulator: null
      }
    ])
  })

  it('sorts the emulators of a platform by name before their options', () => {
    const standalone: EmulatorOptions = {
      emulatorId: 'standalone',
      emulatorName: 'Bsnes Standalone',
      options: [{ ...SNES9X, id: null, name: null }]
    }
    const platforms = groupByPlatform([retroArch(SNES9X), standalone])

    expect(
      platforms[0].emulators.map(({ emulatorId, optionId }) => [emulatorId, optionId])
    ).toEqual([
      ['standalone', null],
      ['retroarch', 'snes9x']
    ])
  })

  it('turns off the platforms the user turned off, and only those', () => {
    const platforms = groupByPlatform(
      [retroArch(SNES9X, MUPEN)],
      [{ platformId: 'nintendo_64', isEnabled: false, defaultEmulator: null }]
    )

    expect(platforms.map(({ id, isEnabled }) => [id, isEnabled])).toEqual([
      ['nintendo_64', false],
      ['super_nes', true]
    ])
  })

  it('keeps the default emulator chosen for a platform while it still plays it', () => {
    const chosen = (emulatorId: string, optionId: string): ReturnType<typeof groupByPlatform> =>
      groupByPlatform(
        [retroArch(SNES9X, BSNES)],
        [{ platformId: 'super_nes', isEnabled: true, defaultEmulator: { emulatorId, optionId } }]
      )

    expect(chosen('retroarch', 'snes9x')[0].defaultEmulator).toEqual({
      emulatorId: 'retroarch',
      optionId: 'snes9x'
    })
    expect(chosen('retroarch', 'mesen')[0].defaultEmulator).toBeNull()
    expect(chosen('other', 'snes9x')[0].defaultEmulator).toBeNull()
  })

  it('ignores what was set for a platform no emulator plays', () => {
    const platforms = groupByPlatform(
      [retroArch(SNES9X)],
      [{ platformId: 'nes', isEnabled: false, defaultEmulator: null }]
    )

    expect(platforms.map(({ id }) => id)).toEqual(['super_nes'])
  })

  it('takes the manufacturer from the first option that says it', () => {
    const silent: EmulatorOption = { ...BSNES, platform: { ...SUPER_NES, manufacturer: null } }
    const platforms = groupByPlatform([retroArch(silent, SNES9X)])

    expect(platforms[0].manufacturer).toBe('Nintendo')
    expect(groupByPlatform([retroArch(silent)])[0].manufacturer).toBeNull()
  })

  it('sorts the platforms by name', () => {
    const platforms = groupByPlatform([retroArch(SNES9X, MUPEN)])

    expect(platforms.map((platform) => platform.name)).toEqual(['Nintendo 64', 'Super Nintendo'])
  })

  it('keeps which emulator each option belongs to', () => {
    const platforms = groupByPlatform([
      { emulatorId: 'first', emulatorName: 'RetroArch', options: [SNES9X] },
      { emulatorId: 'second', emulatorName: 'RetroArch', options: [SNES9X] }
    ])

    expect(platforms[0].emulators.map((emulator) => emulator.emulatorId)).toEqual([
      'first',
      'second'
    ])
  })
})
