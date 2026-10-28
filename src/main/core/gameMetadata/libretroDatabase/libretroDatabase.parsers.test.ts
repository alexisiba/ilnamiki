import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import { encodeRdb } from './libretroDatabase.fixtures'
import { contentStartsOf, parseRdb, readableTitle } from './libretroDatabase.parsers'

/** Records cut from RetroArch 1.22.2's real database of the same name. */
function fixture(name: string): Buffer {
  return readFileSync(new URL(`./fixtures/${name}.rdb`, import.meta.url))
}

describe('parseRdb', () => {
  it('reads every record of a real database, with text, numbers and checksums', () => {
    const records = parseRdb(fixture('Nintendo - Game Boy'))

    expect(records).toHaveLength(2)
    expect(records[0]).toMatchObject({
      name: 'Tetris (World) (Rev 1)',
      rom_name: 'Tetris (World) (Rev 1).gb',
      genre: 'Puzzle',
      users: 2,
      releaseyear: 1989,
      size: 32768,
      crc: '46df91ad',
      sha1: '74591cc9501af93873f9a5d3eb12da12c0723bbc'
    })
  })

  it('reads long names and large numbers as RetroArch writes them', () => {
    expect(parseRdb(fixture('FBNeo - Arcade Games'))[0]).toMatchObject({
      name: 'The King of Fighters 2002 (NGM-2650 ~ NGH-2650)',
      rom_name: 'kof2002.zip',
      size: 84433674,
      crc: '786ecb4d'
    })
  })

  it('reads a game with several records as they are', () => {
    const records = parseRdb(fixture('Nintendo - Super Nintendo Entertainment System'))

    expect(records.map(({ name, rom_name }) => [name, rom_name])).toEqual([
      ['Super Mario World (USA)', 'CLV-P-SAAAE.smc'],
      ['Super Mario World (USA)', 'Super Mario World (USA).sfc']
    ])
  })

  it('reads no records from an empty database', () => {
    expect(parseRdb(encodeRdb([]))).toEqual([])
  })

  it('refuses a file that isn’t a database', () => {
    expect(() => parseRdb(Buffer.from('PK\u0003\u0004 not a database'))).toThrow(
      'Not a libretro database'
    )
  })
})

describe('contentStartsOf', () => {
  const NES_START = Uint8Array.from([0x4e, 0x45, 0x53, 0x1a, 2, 1])

  it('reads a file whole when it has no header', () => {
    expect(contentStartsOf(524288, Uint8Array.from([0, 1, 2, 3]))).toEqual([0])
  })

  it('also skips a SNES copier header, which makes the size 512 over a multiple of 1024', () => {
    expect(contentStartsOf(524288 + 512, Uint8Array.from([0, 1, 2, 3]))).toEqual([0, 512])
  })

  it('also skips an iNES header', () => {
    expect(contentStartsOf(40976, NES_START)).toEqual([0, 16])
  })

  it('reads a file as small as a header whole', () => {
    expect(contentStartsOf(512, Uint8Array.from([0]))).toEqual([0])
    expect(contentStartsOf(16, NES_START)).toEqual([0])
  })
})

describe('readableTitle', () => {
  it('drops the tags in parentheses and brackets', () => {
    expect(readableTitle('Super Mario World (USA)')).toBe('Super Mario World')
    expect(
      readableTitle('Super Mario Advance 4 - Super Mario Bros. 3 (Europe) (En,Fr,De,Es,It)')
    ).toBe('Super Mario Advance 4 - Super Mario Bros. 3')
    expect(readableTitle('Tetris (World) (Rev 1) [b]')).toBe('Tetris')
    expect(readableTitle('The King of Fighters 2002 (NGM-2650 ~ NGH-2650)')).toBe(
      'The King of Fighters 2002'
    )
  })

  it('puts an article moved to the end back in front of its part', () => {
    expect(readableTitle("Legend of Zelda, The - Link's Awakening (USA, Europe) (Rev 2)")).toBe(
      "The Legend of Zelda - Link's Awakening"
    )
    expect(readableTitle('Schtroumpfs, Les (Europe)')).toBe('Les Schtroumpfs')
    expect(readableTitle("Aventura, L' (Italy)")).toBe("L'Aventura")
  })

  it('leaves a comma that isn’t an article as it is', () => {
    expect(readableTitle('Ys I & II, Book One (Japan)')).toBe('Ys I & II, Book One')
  })

  it('says nothing when only tags are left', () => {
    expect(readableTitle('(USA) [!]')).toBeNull()
  })
})
