import { describe, expect, it } from 'vitest'

import type { EmulatorChoice, PlatformEmulator } from '@shared/api'

import { choosePlayingEmulator } from './games.player'

const emulator = (optionId: string | null, emulatorId = 'e1'): PlatformEmulator => ({
  emulatorId,
  emulatorName: emulatorId,
  optionId,
  optionName: optionId,
  extensions: []
})

const choice = (optionId: string | null, emulatorId = 'e1'): EmulatorChoice => ({
  emulatorId,
  optionId
})

// Super Nintendo with two options of one emulator, by name.
const INSTALLED = [emulator('bsnes'), emulator('snes9x')]

describe('choosePlayingEmulator', () => {
  it('plays with the emulator chosen for the game over every other', () => {
    expect(
      choosePlayingEmulator({
        game: choice('snes9x'),
        lastSession: choice('bsnes'),
        platformDefault: choice('bsnes'),
        installed: INSTALLED
      })
    ).toEqual({ emulator: choice('snes9x'), reason: 'game' })
  })

  it('plays with the last session’s emulator over the platform’s, so progress is found', () => {
    expect(
      choosePlayingEmulator({
        game: null,
        lastSession: choice('snes9x'),
        platformDefault: choice('bsnes'),
        installed: INSTALLED
      })
    ).toEqual({ emulator: choice('snes9x'), reason: 'last-session' })
  })

  it('plays a game never played with the platform’s default emulator', () => {
    expect(
      choosePlayingEmulator({
        game: null,
        lastSession: null,
        platformDefault: choice('snes9x'),
        installed: INSTALLED
      })
    ).toEqual({ emulator: choice('snes9x'), reason: 'platform-default' })
  })

  it('plays with the platform’s first emulator when nothing was chosen or played', () => {
    expect(
      choosePlayingEmulator({
        game: null,
        lastSession: null,
        platformDefault: null,
        installed: INSTALLED
      })
    ).toEqual({ emulator: choice('bsnes'), reason: 'first-installed' })
  })

  it('plays with an emulator without options', () => {
    expect(
      choosePlayingEmulator({
        game: choice(null, 'e2'),
        lastSession: null,
        platformDefault: null,
        installed: [...INSTALLED, emulator(null, 'e2')]
      })
    ).toEqual({ emulator: choice(null, 'e2'), reason: 'game' })
  })

  it('passes over an emulator that doesn’t play the platform anymore for the next', () => {
    expect(
      choosePlayingEmulator({
        game: choice('snes9x', 'gone'),
        lastSession: choice('mesen'),
        platformDefault: choice('snes9x'),
        installed: INSTALLED
      })
    ).toEqual({ emulator: choice('snes9x'), reason: 'platform-default' })
  })

  it('plays with nothing when no emulator plays the platform', () => {
    expect(
      choosePlayingEmulator({
        game: choice('snes9x'),
        lastSession: choice('snes9x'),
        platformDefault: choice('snes9x'),
        installed: []
      })
    ).toBeNull()
  })
})
