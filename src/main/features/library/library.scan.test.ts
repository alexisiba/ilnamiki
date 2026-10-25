import { describe, expect, it } from 'vitest'

import { findGames, type FoundGame } from './library.scan'

const PLAYSTATION = new Set(['cue', 'bin', 'img', 'iso', 'chd', 'pbp', 'm3u'])
const NINTENDO_64 = new Set(['n64', 'v64', 'z64', 'bin'])
const DREAMCAST = new Set(['gdi', 'chd'])

/** A cue sheet with one `FILE` line per file, as Redump writes them. */
const cueOf = (...files: string[]): string =>
  files.map((file, i) => `FILE "${file}" BINARY\n  TRACK 0${i + 1} MODE2/2352\n`).join('')

/** The games found in a folder with `files`, whose indexes read `indexTexts`. */
function scan(
  extensions: Set<string>,
  files: string[],
  indexTexts: Record<string, string> = {}
): FoundGame[] {
  return findGames({ files, indexTexts: new Map(Object.entries(indexTexts)), extensions })
}

const ok = (title: string, path: string): FoundGame => ({ title, path, problem: null })

describe('findGames', () => {
  it('finds nothing in an empty folder', () => {
    expect(scan(PLAYSTATION, [])).toEqual([])
  })

  it('finds each file with one of the platform’s extensions as a game, by title', () => {
    expect(scan(NINTENDO_64, ['Super Mario 64 (USA).z64', 'notes.txt', 'Banjo (USA).n64'])).toEqual(
      [ok('Banjo (USA)', 'Banjo (USA).n64'), ok('Super Mario 64 (USA)', 'Super Mario 64 (USA).z64')]
    )
  })

  it('matches extensions in any case', () => {
    expect(scan(NINTENDO_64, ['GOLDENEYE.Z64'])).toEqual([ok('GOLDENEYE', 'GOLDENEYE.Z64')])
  })

  it('makes a cue sheet one game with its tracks', () => {
    const files = ['Wipeout XL (Track 1).bin', 'Wipeout XL (Track 2).bin', 'Wipeout XL.cue']
    const cue = cueOf('Wipeout XL (Track 1).bin', 'Wipeout XL (Track 2).bin')

    expect(scan(PLAYSTATION, files, { 'Wipeout XL.cue': cue })).toEqual([
      ok('Wipeout XL', 'Wipeout XL.cue')
    ])
  })

  it('makes a .bin without a cue sheet a game by itself', () => {
    expect(scan(NINTENDO_64, ['Mario Kart 64 (USA).bin'])).toEqual([
      ok('Mario Kart 64 (USA)', 'Mario Kart 64 (USA).bin')
    ])
  })

  it('marks a cue sheet whose tracks aren’t there as damaged, keeping its other tracks', () => {
    const files = ['Wipeout XL (Track 1).bin', 'Wipeout XL.cue']
    const cue = cueOf('Wipeout XL (Track 1).bin', 'Wipeout XL (Track 2).bin')

    expect(scan(PLAYSTATION, files, { 'Wipeout XL.cue': cue })).toEqual([
      {
        title: 'Wipeout XL',
        path: 'Wipeout XL.cue',
        problem: { kind: 'missing-files', files: ['Wipeout XL (Track 2).bin'] }
      }
    ])
  })

  it('marks a cue sheet that names no file, or couldn’t be read, as damaged', () => {
    const files = ['Empty.cue', 'Unread.cue']

    expect(scan(PLAYSTATION, files, { 'Empty.cue': 'REM nothing\n' })).toEqual([
      { title: 'Empty', path: 'Empty.cue', problem: { kind: 'empty-index' } },
      { title: 'Unread', path: 'Unread.cue', problem: { kind: 'empty-index' } }
    ])
  })

  it('finds a cue sheet’s tracks whatever their case', () => {
    const files = ['Tekken 3 (Track 1).bin', 'Tekken 3.cue']
    const cue = cueOf('TEKKEN 3 (TRACK 1).BIN')

    expect(scan(PLAYSTATION, files, { 'Tekken 3.cue': cue })).toEqual([
      ok('Tekken 3', 'Tekken 3.cue')
    ])
  })

  it('looks for a track written with another computer’s path next to the cue sheet', () => {
    const files = ['Spyro/Spyro.bin', 'Spyro/Spyro.cue']
    const cue = cueOf('C:\\Users\\Someone\\Games\\Spyro.bin')

    expect(scan(PLAYSTATION, files, { 'Spyro/Spyro.cue': cue })).toEqual([
      ok('Spyro', 'Spyro/Spyro.cue')
    ])
  })

  it('makes a playlist one game with its discs and their tracks', () => {
    const files = [
      'Final Fantasy VII.m3u',
      'Final Fantasy VII (Disc 1).cue',
      'Final Fantasy VII (Disc 1).bin',
      'Final Fantasy VII (Disc 2).cue',
      'Final Fantasy VII (Disc 2).bin'
    ]

    expect(
      scan(PLAYSTATION, files, {
        'Final Fantasy VII.m3u': 'Final Fantasy VII (Disc 1).cue\nFinal Fantasy VII (Disc 2).cue\n',
        'Final Fantasy VII (Disc 1).cue': cueOf('Final Fantasy VII (Disc 1).bin'),
        'Final Fantasy VII (Disc 2).cue': cueOf('Final Fantasy VII (Disc 2).bin')
      })
    ).toEqual([ok('Final Fantasy VII', 'Final Fantasy VII.m3u')])
  })

  it('marks a playlist damaged when a disc’s track isn’t there', () => {
    const files = [
      'Metal Gear Solid.m3u',
      'MGS (Disc 1).cue',
      'MGS (Disc 2).cue',
      'MGS (Disc 2).bin'
    ]

    expect(
      scan(PLAYSTATION, files, {
        'Metal Gear Solid.m3u': 'MGS (Disc 1).cue\nMGS (Disc 2).cue',
        'MGS (Disc 1).cue': cueOf('MGS (Disc 1).bin'),
        'MGS (Disc 2).cue': cueOf('MGS (Disc 2).bin')
      })
    ).toEqual([
      {
        title: 'Metal Gear Solid',
        path: 'Metal Gear Solid.m3u',
        problem: { kind: 'missing-files', files: ['MGS (Disc 1).bin'] }
      }
    ])
  })

  it('reads a playlist’s discs from a hidden folder, without listing them', () => {
    const files = [
      'Chrono Cross.m3u',
      '.discs/Chrono Cross (Disc 1).chd',
      '.discs/Chrono Cross (Disc 2).chd'
    ]
    const playlist = '.discs/Chrono Cross (Disc 1).chd\n.discs/Chrono Cross (Disc 2).chd\n'

    expect(scan(PLAYSTATION, files, { 'Chrono Cross.m3u': playlist })).toEqual([
      ok('Chrono Cross', 'Chrono Cross.m3u')
    ])
  })

  it('lists nothing from hidden folders or hidden files by themselves', () => {
    expect(scan(PLAYSTATION, ['.trash/Old.chd', '.Hidden.chd', 'Visible.chd'])).toEqual([
      ok('Visible', 'Visible.chd')
    ])
  })

  it('finds the games inside subfolders, as one list', () => {
    const files = ['Crash/Crash.cue', 'Crash/Crash.bin', 'Tekken 3.chd']

    expect(scan(PLAYSTATION, files, { 'Crash/Crash.cue': cueOf('Crash.bin') })).toEqual([
      ok('Crash', 'Crash/Crash.cue'),
      ok('Tekken 3', 'Tekken 3.chd')
    ])
  })

  it('makes a .gdi one game with its tracks', () => {
    const files = ['Shenmue/disc.gdi', 'Shenmue/track01.bin', 'Shenmue/track02.raw']
    const gdi = '2\n1 0 4 2352 track01.bin 0\n2 756 0 2352 track02.raw 0\n'

    expect(scan(DREAMCAST, files, { 'Shenmue/disc.gdi': gdi })).toEqual([
      ok('disc', 'Shenmue/disc.gdi')
    ])
  })

  it('makes a CloneCD image one game with its .img and .sub, and damaged without its .img', () => {
    const extensions = new Set(['ccd', 'img'])

    expect(scan(extensions, ['Ape Escape.ccd', 'Ape Escape.img', 'Ape Escape.sub'])).toEqual([
      ok('Ape Escape', 'Ape Escape.ccd')
    ])
    expect(scan(extensions, ['Ape Escape.ccd'])).toEqual([
      {
        title: 'Ape Escape',
        path: 'Ape Escape.ccd',
        problem: { kind: 'missing-files', files: ['Ape Escape.img'] }
      }
    ])
  })

  it('ignores indexes the platform doesn’t play, listing their files by themselves', () => {
    const files = ['Game.cue', 'Game.bin']

    expect(scan(NINTENDO_64, files, { 'Game.cue': cueOf('Game.bin') })).toEqual([
      ok('Game', 'Game.bin')
    ])
  })

  it('finds archives as games when the platform’s extensions include them', () => {
    const extensions = new Set(['n64', 'z64', 'zip', '7z'])

    expect(scan(extensions, ['Super Mario 64 (USA).zip', 'Wave Race 64.7z'])).toEqual([
      ok('Super Mario 64 (USA)', 'Super Mario 64 (USA).zip'),
      ok('Wave Race 64', 'Wave Race 64.7z')
    ])
  })

  it('lists the same game in two formats twice', () => {
    expect(scan(PLAYSTATION, ['Tekken 3.chd', 'Tekken 3.pbp'])).toEqual([
      ok('Tekken 3', 'Tekken 3.chd'),
      ok('Tekken 3', 'Tekken 3.pbp')
    ])
  })
})
