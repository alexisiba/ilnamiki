import { describe, expect, it } from 'vitest'

import type { InstalledCore } from '@shared/api'

import { choosePlayingCore } from './games.player'

const core = (coreId: string, emulatorId = 'e1'): InstalledCore => ({
  id: coreId,
  name: coreId,
  emulatorId,
  extensions: []
})

const ref = (coreId: string, emulatorId = 'e1'): { emulatorId: string; coreId: string } => ({
  emulatorId,
  coreId
})

// Super Nintendo with two cores installed, by name.
const INSTALLED = [core('bsnes'), core('snes9x')]

describe('choosePlayingCore', () => {
  it('plays with the core chosen for the game over every other', () => {
    expect(
      choosePlayingCore({
        game: ref('snes9x'),
        lastSession: ref('bsnes'),
        platformDefault: ref('bsnes'),
        installed: INSTALLED
      })
    ).toEqual({ core: ref('snes9x'), reason: 'game' })
  })

  it('plays with the last session’s core over the platform’s, so progress is found', () => {
    expect(
      choosePlayingCore({
        game: null,
        lastSession: ref('snes9x'),
        platformDefault: ref('bsnes'),
        installed: INSTALLED
      })
    ).toEqual({ core: ref('snes9x'), reason: 'last-session' })
  })

  it('plays a game never played with the platform’s default core', () => {
    expect(
      choosePlayingCore({
        game: null,
        lastSession: null,
        platformDefault: ref('snes9x'),
        installed: INSTALLED
      })
    ).toEqual({ core: ref('snes9x'), reason: 'platform-default' })
  })

  it('plays with the platform’s first core when nothing was chosen or played', () => {
    expect(
      choosePlayingCore({
        game: null,
        lastSession: null,
        platformDefault: null,
        installed: INSTALLED
      })
    ).toEqual({ core: ref('bsnes'), reason: 'first-installed' })
  })

  it('passes over a core that isn’t installed anymore for the next', () => {
    expect(
      choosePlayingCore({
        game: ref('snes9x', 'gone'),
        lastSession: ref('mesen'),
        platformDefault: ref('snes9x'),
        installed: INSTALLED
      })
    ).toEqual({ core: ref('snes9x'), reason: 'platform-default' })
  })

  it('plays with nothing when no installed core plays the platform', () => {
    expect(
      choosePlayingCore({
        game: ref('snes9x'),
        lastSession: ref('snes9x'),
        platformDefault: ref('snes9x'),
        installed: []
      })
    ).toBeNull()
  })
})
