import { describe, expect, it } from 'vitest'

import { encodeDisc, memoryReader } from './libretroDatabase.fixtures'
import { serialOf } from './libretroDatabase.serial'

const CRASH_CNF = 'BOOT = cdrom:\\SCUS_949.00;1\r\nTCB = 4\r\nEVENT = 10\r\nSTACK = 801FFFF0\r\n'

const BLACK_CNF = 'BOOT2 = cdrom0:\\SLUS_213.76;1\nVER = 1.00\nVMODE = NTSC\n'

const cue = (file: string): Buffer =>
  Buffer.from(`FILE "${file}" BINARY\r\n  TRACK 01 MODE2/2352\r\n    INDEX 01 00:00:00\r\n`)

describe('serialOf', () => {
  it('reads a PlayStation disc’s serial from the first file its cue sheet names', async () => {
    const reader = memoryReader({
      '/roms/psx/Crash Bandicoot.cue': cue('Crash Bandicoot.bin'),
      '/roms/psx/Crash Bandicoot.bin': encodeDisc({ 'SYSTEM.CNF': CRASH_CNF }, 'mode2')
    })

    expect(await serialOf('playstation', '/roms/psx/Crash Bandicoot.cue', reader)).toBe(
      'SCUS-94900'
    )
  })

  it('reads the serial from disc images of every kind of sector', async () => {
    for (const sectors of ['iso', 'mode1', 'mode2'] as const) {
      const reader = memoryReader({
        '/roms/disc.bin': encodeDisc({ 'SYSTEM.CNF': CRASH_CNF }, sectors)
      })

      expect(await serialOf('playstation', '/roms/disc.bin', reader)).toBe('SCUS-94900')
    }
  })

  it('reads a PlayStation 2 disc’s serial, finding SYSTEM.CNF among other files', async () => {
    const reader = memoryReader({
      '/roms/ps2/Black (USA).iso': encodeDisc({
        'IOPRP300.IMG': 'modules',
        'system.cnf': BLACK_CNF,
        'SLUS_213.76': 'program'
      })
    })

    expect(await serialOf('playstation2', '/roms/ps2/Black (USA).iso', reader)).toBe('SLUS-21376')
  })

  it('reads nothing on a platform whose serial it doesn’t read', async () => {
    const reader = memoryReader({ '/roms/disc.iso': encodeDisc({ 'SYSTEM.CNF': CRASH_CNF }) })

    expect(await serialOf('sega_saturn', '/roms/disc.iso', reader)).toBeNull()
  })

  it('gives nothing when the disc doesn’t say a serial', async () => {
    const reader = memoryReader({
      '/roms/no-cnf.iso': encodeDisc({ 'PSX.EXE': 'program' }),
      '/roms/not-iso.bin': encodeDisc(null, 'mode2'),
      '/roms/tiny.bin': Buffer.alloc(100),
      '/roms/no-file.cue': Buffer.from('TRACK 01 MODE2/2352\n'),
      '/roms/missing.cue': cue('missing.bin'),
      '/roms/game.chd': encodeDisc({ 'SYSTEM.CNF': CRASH_CNF })
    })

    for (const path of [
      '/roms/no-cnf.iso',
      '/roms/not-iso.bin',
      '/roms/tiny.bin',
      '/roms/no-file.cue',
      '/roms/missing.cue',
      '/roms/game.chd',
      '/roms/absent.iso'
    ]) {
      expect(await serialOf('playstation', path, reader)).toBeNull()
    }
  })
})
