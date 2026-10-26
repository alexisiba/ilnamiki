import { describe, expect, it } from 'vitest'

import type { InstalledCore } from '@shared/api'

import { isAmongCores, parseCoreRef } from './installedPlatforms.cores'

const EMULATOR_ID = '33b85b34-3541-4897-bd70-49ed7143fcfd'

const CORES: InstalledCore[] = [
  { id: 'bsnes', name: 'bsnes', emulatorId: EMULATOR_ID, extensions: [] },
  { id: 'snes9x', name: 'Snes9x', emulatorId: EMULATOR_ID, extensions: [] }
]

describe('isAmongCores', () => {
  it('finds a core by its id and its emulator', () => {
    expect(isAmongCores({ emulatorId: EMULATOR_ID, coreId: 'snes9x' }, CORES)).toBe(true)
  })

  it('doesn’t find another core, or the same core of another emulator', () => {
    expect(isAmongCores({ emulatorId: EMULATOR_ID, coreId: 'mesen' }, CORES)).toBe(false)
    expect(isAmongCores({ emulatorId: 'other', coreId: 'snes9x' }, CORES)).toBe(false)
  })
})

describe('parseCoreRef', () => {
  it('accepts a core of an emulator', () => {
    expect(parseCoreRef({ emulatorId: EMULATOR_ID, coreId: 'mupen64plus_next' })).toEqual({
      emulatorId: EMULATOR_ID,
      coreId: 'mupen64plus_next'
    })
  })

  it('keeps only the fields it knows', () => {
    expect(parseCoreRef({ emulatorId: EMULATOR_ID, coreId: 'bsnes', path: '/etc' })).toEqual({
      emulatorId: EMULATOR_ID,
      coreId: 'bsnes'
    })
  })

  it('refuses anything that can’t be a core of an emulator', () => {
    expect(parseCoreRef(null)).toBeNull()
    expect(parseCoreRef('bsnes')).toBeNull()
    expect(parseCoreRef({ emulatorId: 'e1', coreId: 'bsnes' })).toBeNull()
    expect(parseCoreRef({ emulatorId: EMULATOR_ID, coreId: '../core' })).toBeNull()
    expect(parseCoreRef({ emulatorId: EMULATOR_ID })).toBeNull()
  })
})
