import { describe, expect, it } from 'vitest'

import type { InstalledPlatform } from '@shared/api'

import { countLinkedPlatforms } from './GameSetup.utils'

const platform = (id: string, emulatorIds: string[]): InstalledPlatform => ({
  id,
  name: id,
  manufacturer: null,
  cores: emulatorIds.map((emulatorId, index) => ({
    id: `${id}-core-${index}`,
    name: `Core ${index}`,
    emulatorId,
    extensions: []
  }))
})

describe('countLinkedPlatforms', () => {
  it('counts the platforms the emulator plays, once each however many cores it has', () => {
    const platforms = [
      platform('nes', ['a1', 'a1']),
      platform('snes', ['a1', 'b2']),
      platform('n64', ['b2'])
    ]

    expect(countLinkedPlatforms('a1', platforms)).toBe(2)
    expect(countLinkedPlatforms('b2', platforms)).toBe(2)
    expect(countLinkedPlatforms('c3', platforms)).toBe(0)
  })
})
