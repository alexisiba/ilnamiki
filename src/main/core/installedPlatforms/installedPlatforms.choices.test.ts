import { describe, expect, it } from 'vitest'

import type { PlatformEmulator } from '@shared/api'

import { isAmongEmulators, parseEmulatorChoice } from './installedPlatforms.choices'

const RETROARCH_ID = '33b85b34-3541-4897-bd70-49ed7143fcfd'
const STANDALONE_ID = '8f0c1f43-4d7b-4a8e-9a55-2f4e6f1d2c3b'

const retroArch = (optionId: string, optionName: string): PlatformEmulator => ({
  emulatorId: RETROARCH_ID,
  emulatorName: 'RetroArch',
  optionId,
  optionName,
  extensions: []
})

const EMULATORS: PlatformEmulator[] = [
  retroArch('bsnes', 'bsnes'),
  retroArch('snes9x', 'Snes9x'),
  {
    emulatorId: STANDALONE_ID,
    emulatorName: 'Standalone',
    optionId: null,
    optionName: null,
    extensions: []
  }
]

describe('isAmongEmulators', () => {
  it('finds an emulator by its id and its option', () => {
    expect(isAmongEmulators({ emulatorId: RETROARCH_ID, optionId: 'snes9x' }, EMULATORS)).toBe(true)
  })

  it('finds an emulator without options', () => {
    expect(isAmongEmulators({ emulatorId: STANDALONE_ID, optionId: null }, EMULATORS)).toBe(true)
  })

  it('doesn’t find another option, or the same option of another emulator', () => {
    expect(isAmongEmulators({ emulatorId: RETROARCH_ID, optionId: 'mesen' }, EMULATORS)).toBe(false)
    expect(isAmongEmulators({ emulatorId: RETROARCH_ID, optionId: null }, EMULATORS)).toBe(false)
    expect(isAmongEmulators({ emulatorId: 'other', optionId: 'snes9x' }, EMULATORS)).toBe(false)
  })
})

describe('parseEmulatorChoice', () => {
  it('accepts an emulator with one of its options', () => {
    expect(parseEmulatorChoice({ emulatorId: RETROARCH_ID, optionId: 'mupen64plus_next' })).toEqual(
      { emulatorId: RETROARCH_ID, optionId: 'mupen64plus_next' }
    )
  })

  it('accepts an emulator without options', () => {
    expect(parseEmulatorChoice({ emulatorId: STANDALONE_ID, optionId: null })).toEqual({
      emulatorId: STANDALONE_ID,
      optionId: null
    })
  })

  it('keeps only the fields it knows', () => {
    expect(
      parseEmulatorChoice({ emulatorId: RETROARCH_ID, optionId: 'bsnes', path: '/etc' })
    ).toEqual({ emulatorId: RETROARCH_ID, optionId: 'bsnes' })
  })

  it('refuses anything that can’t be an emulator choice', () => {
    expect(parseEmulatorChoice(null)).toBeNull()
    expect(parseEmulatorChoice('bsnes')).toBeNull()
    expect(parseEmulatorChoice({ emulatorId: 'e1', optionId: 'bsnes' })).toBeNull()
    expect(parseEmulatorChoice({ emulatorId: RETROARCH_ID, optionId: '../option' })).toBeNull()
    expect(parseEmulatorChoice({ emulatorId: RETROARCH_ID })).toBeNull()
  })
})
