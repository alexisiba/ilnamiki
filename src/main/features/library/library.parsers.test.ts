import { describe, expect, it } from 'vitest'

import {
  extensionOf,
  indexKindOf,
  parseCueFiles,
  parseGdiFiles,
  parseM3uEntries,
  titleOf
} from './library.parsers'

/** A two-track cue sheet as Redump writes them. */
const REDUMP_CUE = [
  'FILE "Wipeout XL (USA) (Track 1).bin" BINARY',
  '  TRACK 01 MODE2/2352',
  '    INDEX 01 00:00:00',
  'FILE "Wipeout XL (USA) (Track 2).bin" BINARY',
  '  TRACK 02 AUDIO',
  '    INDEX 00 00:00:00',
  '    INDEX 01 00:02:00',
  ''
].join('\r\n')

/** A Dreamcast .gdi: the track count, then one line per track. */
const GDI = [
  '3',
  '1 0 4 2352 track01.bin 0',
  '2 756 0 2352 "track 02.raw" 0',
  '3 45000 4 2352 track03.bin 0',
  ''
].join('\n')

describe('extensionOf', () => {
  it('reads the extension in lowercase', () => {
    expect(extensionOf('Disc/Game (USA).CUE')).toBe('cue')
  })

  it('reads none from a file without one, or a hidden file', () => {
    expect(extensionOf('README')).toBe('')
    expect(extensionOf('.hidden')).toBe('')
  })
})

describe('titleOf', () => {
  it('names a game by its file, without the extension or folder', () => {
    expect(titleOf('Crash/Crash Bandicoot (USA) [!].chd')).toBe('Crash Bandicoot (USA) [!]')
  })
})

describe('indexKindOf', () => {
  it('recognizes playlists, cue sheets, .gdi and CloneCD images, in any case', () => {
    expect(indexKindOf('Game.m3u')).toBe('m3u')
    expect(indexKindOf('Game.CUE')).toBe('cue')
    expect(indexKindOf('Game.gdi')).toBe('gdi')
    expect(indexKindOf('Game.ccd')).toBe('ccd')
  })

  it('recognizes nothing else', () => {
    expect(indexKindOf('Game.bin')).toBeNull()
    expect(indexKindOf('Game.chd')).toBeNull()
  })
})

describe('parseCueFiles', () => {
  it('reads every file of a cue sheet', () => {
    expect(parseCueFiles(REDUMP_CUE)).toEqual([
      'Wipeout XL (USA) (Track 1).bin',
      'Wipeout XL (USA) (Track 2).bin'
    ])
  })

  it('reads unquoted names, lowercase commands and a byte order mark', () => {
    const cue = `${String.fromCharCode(0xfeff)}file game.bin BINARY\n  TRACK 01 MODE1/2352\n`

    expect(parseCueFiles(cue)).toEqual(['game.bin'])
  })

  it('reads none from a cue sheet without files', () => {
    expect(parseCueFiles('REM GENRE Racing\n')).toEqual([])
  })
})

describe('parseGdiFiles', () => {
  it('reads every track’s file, quoted or not, skipping the track count', () => {
    expect(parseGdiFiles(GDI)).toEqual(['track01.bin', 'track 02.raw', 'track03.bin'])
  })
})

describe('parseM3uEntries', () => {
  it('reads each disc, skipping comments and empty lines', () => {
    const playlist =
      '#EXTM3U\nFinal Fantasy VII (Disc 1).chd\n\n  Final Fantasy VII (Disc 2).chd  \r\n'

    expect(parseM3uEntries(playlist)).toEqual([
      'Final Fantasy VII (Disc 1).chd',
      'Final Fantasy VII (Disc 2).chd'
    ])
  })
})
