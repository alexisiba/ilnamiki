import { describe, expect, it } from 'vitest'

import type { InstalledPlatform, PlatformEmulator } from '@renderer/types/installedPlatform'

import { getPlatformExtensions } from './platformExtensions'

const retroArch = (
  optionId: string,
  optionName: string,
  extensions: string[]
): PlatformEmulator => ({
  emulatorId: 'a1',
  emulatorName: 'RetroArch',
  optionId,
  optionName,
  extensions
})

const SUPER_NES: InstalledPlatform = {
  id: 'super_nes',
  name: 'Super Nintendo',
  manufacturer: 'Nintendo',
  emulators: [
    retroArch('bsnes', 'bsnes', ['sfc', 'bs']),
    retroArch('snes9x', 'Snes9x', ['smc', 'sfc'])
  ],
  isEnabled: true,
  defaultEmulator: null
}

describe('getPlatformExtensions', () => {
  it('lists the extensions of every emulator once each, in the order they declare them', () => {
    expect(getPlatformExtensions(SUPER_NES)).toEqual(['sfc', 'bs', 'smc'])
  })

  it('is empty when no emulator declares any', () => {
    const emulators = SUPER_NES.emulators.map((emulator) => ({ ...emulator, extensions: [] }))

    expect(getPlatformExtensions({ ...SUPER_NES, emulators })).toEqual([])
  })
})
