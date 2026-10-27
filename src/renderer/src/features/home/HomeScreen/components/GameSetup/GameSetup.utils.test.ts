import { describe, expect, it } from 'vitest'

import type { InstalledPlatform } from '@shared/api'

import { countLinkedPlatforms } from './GameSetup.utils'

const platform = (id: string, emulatorIds: string[]): InstalledPlatform => ({
  id,
  name: id,
  manufacturer: null,
  emulators: emulatorIds.map((emulatorId, index) => ({
    emulatorId,
    emulatorName: emulatorId,
    optionId: `${id}-option-${index}`,
    optionName: `Option ${index}`,
    extensions: []
  })),
  isEnabled: true,
  defaultEmulator: null
})

describe('countLinkedPlatforms', () => {
  it('counts the platforms the emulator plays, once each however many options it has', () => {
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
