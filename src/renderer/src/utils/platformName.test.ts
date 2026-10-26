import { describe, expect, it } from 'vitest'

import type { InstalledPlatform } from '@shared/api'

import { getPlatformName } from './platformName'

const platform = (id: string, name: string): InstalledPlatform => ({
  id,
  name,
  manufacturer: null,
  cores: []
})

describe('getPlatformName', () => {
  it('names a console as the catalog does', () => {
    expect(getPlatformName('playstation', [platform('playstation', 'Sony - PlayStation')])).toBe(
      'PlayStation'
    )
  })

  it('names a console the catalog doesn’t know as its cores do', () => {
    expect(getPlatformName('quake_3', [platform('quake_3', 'Quake III')])).toBe('Quake III')
  })

  it('names a console no emulator plays anymore by its id', () => {
    expect(getPlatformName('quake_3', [])).toBe('quake_3')
  })
})
