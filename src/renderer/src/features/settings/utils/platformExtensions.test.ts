import { describe, expect, it } from 'vitest'

import type { InstalledPlatform } from '@renderer/types/installedPlatform'

import { getPlatformExtensions } from './platformExtensions'

const SUPER_NES: InstalledPlatform = {
  id: 'super_nes',
  name: 'Super Nintendo',
  manufacturer: 'Nintendo',
  cores: [
    { id: 'bsnes', name: 'bsnes', emulatorId: 'a1', extensions: ['sfc', 'bs'] },
    { id: 'snes9x', name: 'Snes9x', emulatorId: 'a1', extensions: ['smc', 'sfc'] }
  ],
  isEnabled: true,
  defaultCore: null
}

describe('getPlatformExtensions', () => {
  it('lists the extensions of every core once each, in the order they declare them', () => {
    expect(getPlatformExtensions(SUPER_NES)).toEqual(['sfc', 'bs', 'smc'])
  })

  it('is empty when no core declares any', () => {
    const cores = SUPER_NES.cores.map((core) => ({ ...core, extensions: [] }))

    expect(getPlatformExtensions({ ...SUPER_NES, cores })).toEqual([])
  })
})
