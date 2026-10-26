import { describe, expect, it } from 'vitest'

import { groupByPlatform } from './installedPlatforms.grouping'
import type { DetectedCore } from './installedPlatforms.types'

const SNES9X: DetectedCore = {
  id: 'snes9x',
  name: 'Snes9x',
  platformId: 'super_nes',
  platformName: 'Super Nintendo',
  platformManufacturer: 'Nintendo',
  extensions: ['smc', 'sfc']
}
const BSNES: DetectedCore = { ...SNES9X, id: 'bsnes', name: 'bsnes', extensions: ['sfc', 'bs'] }
const MUPEN: DetectedCore = {
  id: 'mupen64plus_next',
  name: 'Mupen64Plus-Next',
  platformId: 'nintendo_64',
  platformName: 'Nintendo 64',
  platformManufacturer: 'Nintendo',
  extensions: ['n64']
}

describe('groupByPlatform', () => {
  it('lists no platforms without cores', () => {
    expect(groupByPlatform([])).toEqual([])
    expect(groupByPlatform([{ emulatorId: 'retroarch', cores: [] }])).toEqual([])
  })

  it('makes each platform one entry with every core that plays it, by name', () => {
    const platforms = groupByPlatform([{ emulatorId: 'retroarch', cores: [SNES9X, BSNES] }])

    expect(platforms).toEqual([
      {
        id: 'super_nes',
        name: 'Super Nintendo',
        manufacturer: 'Nintendo',
        cores: [
          { id: 'bsnes', name: 'bsnes', emulatorId: 'retroarch', extensions: ['sfc', 'bs'] },
          { id: 'snes9x', name: 'Snes9x', emulatorId: 'retroarch', extensions: ['smc', 'sfc'] }
        ],
        isEnabled: true
      }
    ])
  })

  it('turns off the platforms the user turned off, and only those', () => {
    const platforms = groupByPlatform(
      [{ emulatorId: 'retroarch', cores: [SNES9X, MUPEN] }],
      new Set(['nintendo_64'])
    )

    expect(platforms.map(({ id, isEnabled }) => [id, isEnabled])).toEqual([
      ['nintendo_64', false],
      ['super_nes', true]
    ])
  })

  it('takes the manufacturer from the first core that says it', () => {
    const silent: DetectedCore = { ...BSNES, platformManufacturer: null }
    const platforms = groupByPlatform([{ emulatorId: 'retroarch', cores: [silent, SNES9X] }])

    expect(platforms[0].manufacturer).toBe('Nintendo')
    expect(groupByPlatform([{ emulatorId: 'e', cores: [silent] }])[0].manufacturer).toBeNull()
  })

  it('sorts the platforms by name', () => {
    const platforms = groupByPlatform([{ emulatorId: 'retroarch', cores: [SNES9X, MUPEN] }])

    expect(platforms.map((platform) => platform.name)).toEqual(['Nintendo 64', 'Super Nintendo'])
  })

  it('keeps which emulator each core is installed in', () => {
    const platforms = groupByPlatform([
      { emulatorId: 'first', cores: [SNES9X] },
      { emulatorId: 'second', cores: [SNES9X] }
    ])

    expect(platforms[0].cores.map((core) => core.emulatorId)).toEqual(['first', 'second'])
  })
})
