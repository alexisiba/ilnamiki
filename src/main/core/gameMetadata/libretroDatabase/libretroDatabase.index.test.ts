import { describe, expect, it } from 'vitest'

import { type DatabaseIndex, findGame, type GameFile, indexRecords } from './libretroDatabase.index'

const GAME_BOY = {
  name: 'Nintendo - Game Boy',
  index: indexRecords([
    {
      name: 'Tetris (World) (Rev 1)',
      rom_name: 'Tetris (World) (Rev 1).gb',
      genre: 'Puzzle',
      users: 2,
      releaseyear: 1989,
      developer: 'Nintendo',
      publisher: 'Nintendo',
      crc: '46df91ad'
    },
    {
      name: "Legend of Zelda, The - Link's Awakening (USA, Europe) (Rev 2)",
      genre: 'Role-playing (RPG)',
      users: 1,
      releaseyear: 1993,
      crc: '34d08e7b'
    }
  ])
}

// As RetroArch's database has it: a record from the SNES Classic's files without details,
// then the full one.
const SUPER_NES = {
  name: 'Nintendo - Super Nintendo Entertainment System',
  index: indexRecords([
    { name: 'Super Mario World (USA)', rom_name: 'CLV-P-SAAAE.smc', crc: '5d3c0fae' },
    {
      name: 'Super Mario World (USA)',
      rom_name: 'Super Mario World (USA).sfc',
      genre: 'Platform',
      users: 2,
      releasemonth: 8,
      releaseyear: 1991,
      developer: 'Nintendo',
      publisher: 'Nintendo',
      crc: 'b19ed489'
    }
  ])
}

const ARCADE = {
  name: 'FBNeo - Arcade Games',
  index: indexRecords([
    {
      name: 'The King of Fighters 2002 (NGM-2650 ~ NGH-2650)',
      rom_name: 'kof2002.zip',
      releaseyear: 2002,
      publisher: 'Eolith / Playmore',
      crc: '786ecb4d'
    }
  ])
}

/** A serial as the parser gives it: the databases write serials as bytes, read as hex. */
const serial = (text: string): string => Buffer.from(text, 'latin1').toString('hex')

const PLAYSTATION = {
  name: 'Sony - PlayStation',
  index: indexRecords([
    { name: 'Crash Bandicoot (USA)', serial: serial('SCUS-94900'), crc: '41b5f211' },
    {
      name: 'Metal Gear Solid (USA) (Disc 1) (Rev 1)',
      serial: serial('SLUS-00594'),
      crc: '21b5d15d'
    }
  ])
}

const databases = (...list: { name: string; index: DatabaseIndex }[]): typeof list => list

const file = (crcs: string[], fileName: string, discSerial: string | null = null): GameFile => ({
  crcs,
  serial: discSerial,
  fileName
})

describe('indexRecords', () => {
  it('gives the details of each game, readable', () => {
    expect(
      GAME_BOY.index.details.get("Legend of Zelda, The - Link's Awakening (USA, Europe) (Rev 2)")
    ).toEqual({
      title: "The Legend of Zelda - Link's Awakening",
      releaseYear: 1993,
      releaseMonth: null,
      developer: null,
      publisher: null,
      genre: 'Role-playing (RPG)',
      players: 1
    })
  })

  it('joins what each record of a game says', () => {
    expect(SUPER_NES.index.details.get('Super Mario World (USA)')).toEqual({
      title: 'Super Mario World',
      releaseYear: 1991,
      releaseMonth: 8,
      developer: 'Nintendo',
      publisher: 'Nintendo',
      genre: 'Platform',
      players: 2
    })
  })

  it('finds each game by its serial, as discs say it', () => {
    const index = indexRecords([
      { name: 'Gex 3 - Deep Cover Gecko (USA)', serial: serial('slus-00806') },
      { name: 'Gex 3 - Deep Cover Gecko (USA)', serial: serial('SLUS-00806') }
    ])

    expect(index.bySerial).toEqual(new Map([['SLUS-00806', 'Gex 3 - Deep Cover Gecko (USA)']]))
  })

  it('leaves out a serial two games have, since it tells neither', () => {
    const index = indexRecords([
      { name: 'Game (USA)', serial: serial('SLUS-00001') },
      { name: 'Other Game (USA)', serial: serial('SLUS-00001') },
      { name: 'Third Game (USA)', serial: serial('SLUS-00001') }
    ])

    expect(index.bySerial.size).toBe(0)
  })

  it('leaves out a record without a name, and values that can’t be right', () => {
    const index = indexRecords([
      { crc: '00000001' },
      { name: 'Game (USA)', releaseyear: 0, releasemonth: 13, users: 0, genre: ' ' }
    ])

    expect(index.byCrc.size).toBe(0)
    expect(index.bySerial.size).toBe(0)
    expect(index.details.get('Game (USA)')).toEqual({
      title: 'Game',
      releaseYear: null,
      releaseMonth: null,
      developer: null,
      publisher: null,
      genre: null,
      players: null
    })
  })
})

describe('findGame', () => {
  it('finds a game by any of its CRCs', () => {
    expect(
      findGame(
        databases(SUPER_NES),
        file(['a31bead4', 'b19ed489'], 'Super Mario World (U) [!].smc')
      )
    ).toEqual({ database: SUPER_NES.name, name: 'Super Mario World (USA)', identifiedBy: 'crc' })
  })

  it('looks for the CRC in every database before looking for the name', () => {
    expect(
      findGame(databases(GAME_BOY, SUPER_NES), file(['b19ed489'], 'Tetris (World) (Rev 1).gb'))
    ).toEqual({ database: SUPER_NES.name, name: 'Super Mario World (USA)', identifiedBy: 'crc' })
  })

  it('finds a disc by its serial when no CRC matches', () => {
    expect(
      findGame(databases(PLAYSTATION), file(['0b0b0b0b'], 'Crash Bandicoot.cue', 'SCUS-94900'))
    ).toEqual({ database: PLAYSTATION.name, name: 'Crash Bandicoot (USA)', identifiedBy: 'serial' })
  })

  it('takes the CRC before the serial, and the serial before the name', () => {
    expect(
      findGame(
        databases(PLAYSTATION),
        file(['21b5d15d'], 'Crash Bandicoot (USA).cue', 'SCUS-94900')
      )
    ).toMatchObject({ name: 'Metal Gear Solid (USA) (Disc 1) (Rev 1)', identifiedBy: 'crc' })
    expect(
      findGame(databases(PLAYSTATION), file([], 'Crash Bandicoot (USA).cue', 'SLUS-00594'))
    ).toMatchObject({ name: 'Metal Gear Solid (USA) (Disc 1) (Rev 1)', identifiedBy: 'serial' })
  })

  it('finds an arcade game by its archive’s name', () => {
    expect(findGame(databases(ARCADE), file([], 'kof2002.zip'))).toEqual({
      database: ARCADE.name,
      name: 'The King of Fighters 2002 (NGM-2650 ~ NGH-2650)',
      identifiedBy: 'file-name'
    })
  })

  it('finds a game whose file is named as the database names it, whatever its extension', () => {
    expect(findGame(databases(GAME_BOY), file([], 'Tetris (World) (Rev 1).zip'))).toEqual({
      database: GAME_BOY.name,
      name: 'Tetris (World) (Rev 1)',
      identifiedBy: 'file-name'
    })
  })

  it('never takes a similar name or serial for the game', () => {
    expect(
      findGame(databases(SUPER_NES), file(['a31bead4'], 'Super Mario World (U) [!].smc'))
    ).toBeNull()
    expect(findGame(databases(GAME_BOY), file([], 'Tetris (World).gb'))).toBeNull()
    expect(findGame(databases(GAME_BOY), file([], 'tetris (world) (rev 1).gb'))).toBeNull()
    expect(findGame(databases(PLAYSTATION), file([], 'Crash.cue', 'SCUS-94901'))).toBeNull()
  })

  it('finds nothing without databases', () => {
    expect(findGame([], file(['b19ed489'], 'Super Mario World (USA).sfc'))).toBeNull()
  })
})
