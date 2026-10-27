import { describe, expect, it } from 'vitest'

import { edenLaunchArgs, parseEdenVersion } from './eden.parsers'

describe('parseEdenVersion', () => {
  it('reads the version its AppImage declares, without the leading "v"', () => {
    expect(parseEdenVersion('v0.2.1')).toBe('0.2.1')
  })

  it('keeps a version written without "v" as it is', () => {
    expect(parseEdenVersion('0.2.1')).toBe('0.2.1')
    expect(parseEdenVersion('nightly-2026')).toBe('nightly-2026')
  })

  it('says nothing when the AppImage declares no version', () => {
    expect(parseEdenVersion(null)).toBeNull()
    expect(parseEdenVersion('  ')).toBeNull()
  })
})

describe('edenLaunchArgs', () => {
  it('starts in full screen with the game, its path last and as it is', () => {
    expect(edenLaunchArgs('/home/player/Games/Switch/Celeste [0100...].nsp')).toEqual([
      '-f',
      '-g',
      '/home/player/Games/Switch/Celeste [0100...].nsp'
    ])
  })
})
