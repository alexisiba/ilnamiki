import { describe, expect, it } from 'vitest'

import type { PlatformEmulator } from '@shared/api'

import { getEmulatorName, isSameEmulator } from './emulatorName'

const SNES9X: PlatformEmulator = {
  emulatorId: 'e1',
  emulatorName: 'RetroArch',
  optionId: 'snes9x',
  optionName: 'Snes9x',
  extensions: []
}

const EDEN: PlatformEmulator = {
  emulatorId: 'e2',
  emulatorName: 'Eden',
  optionId: null,
  optionName: null,
  extensions: []
}

describe('getEmulatorName', () => {
  it('names an emulator with options after the emulator and the option', () => {
    expect(getEmulatorName(SNES9X)).toBe('RetroArch · Snes9x')
  })

  it('names an emulator without options after the emulator alone', () => {
    expect(getEmulatorName(EDEN)).toBe('Eden')
  })
})

describe('isSameEmulator', () => {
  it('matches the same option of the same emulator', () => {
    expect(isSameEmulator({ emulatorId: 'e1', optionId: 'snes9x' }, SNES9X)).toBe(true)
    expect(isSameEmulator({ emulatorId: 'e2', optionId: null }, EDEN)).toBe(true)
  })

  it('tells apart another option or another emulator', () => {
    expect(isSameEmulator({ emulatorId: 'e1', optionId: 'bsnes' }, SNES9X)).toBe(false)
    expect(isSameEmulator({ emulatorId: 'e1', optionId: null }, SNES9X)).toBe(false)
    expect(isSameEmulator({ emulatorId: 'e3', optionId: 'snes9x' }, SNES9X)).toBe(false)
  })
})
