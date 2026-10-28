import { crc32 } from 'zlib'
import { describe, expect, it, vi } from 'vitest'

import { MetadataUnavailableError } from '../gameMetadata.types'
import { createLibretroDatabase, type LibretroDatabaseFile } from './libretroDatabase'
import { encodeRdb, memoryReader } from './libretroDatabase.fixtures'
import { formatCrc } from './libretroDatabase.parsers'

const TETRIS_ROM = Buffer.alloc(32768, 9)

const GAME_BOY: LibretroDatabaseFile = {
  platformId: 'game_boy',
  name: 'Nintendo - Game Boy',
  path: '/retroarch/rdb/Nintendo - Game Boy.rdb'
}

const ARCADE: LibretroDatabaseFile = {
  platformId: 'fb_alpha',
  name: 'FBNeo - Arcade Games',
  path: '/retroarch/rdb/FBNeo - Arcade Games.rdb'
}

const FILES = {
  [GAME_BOY.path]: encodeRdb([
    {
      name: 'Tetris (World) (Rev 1)',
      rom_name: 'Tetris (World) (Rev 1).gb',
      genre: 'Puzzle',
      users: 2,
      releaseyear: 1989,
      developer: 'Nintendo',
      publisher: 'Nintendo',
      crc: Buffer.from(formatCrc(crc32(TETRIS_ROM)), 'hex')
    }
  ]),
  [ARCADE.path]: encodeRdb([
    {
      name: 'The King of Fighters 2002 (NGM-2650 ~ NGH-2650)',
      rom_name: 'kof2002.zip',
      releaseyear: 2002,
      publisher: 'Eolith / Playmore'
    }
  ]),
  '/roms/gb/my tetris.gb': TETRIS_ROM,
  '/roms/arcade/kof2002.zip': Buffer.alloc(64, 1)
}

/** The provider over `databases` and the files above, and how often it asked for databases. */
function provider(
  databases: LibretroDatabaseFile[],
  files: Record<string, Uint8Array> = FILES
): {
  database: ReturnType<typeof createLibretroDatabase>
  listDatabases: ReturnType<typeof vi.fn>
} {
  const listDatabases = vi.fn(async () => databases)
  return {
    database: createLibretroDatabase(listDatabases, memoryReader(files)),
    listDatabases
  }
}

describe('createLibretroDatabase', () => {
  it('identifies a game by its file’s CRC in its platform’s databases', async () => {
    const { database } = provider([GAME_BOY, ARCADE])

    expect(
      await database.identify({ platformId: 'game_boy', filePath: '/roms/gb/my tetris.gb' })
    ).toEqual({
      providerId: 'libretro-database',
      database: 'Nintendo - Game Boy',
      name: 'Tetris (World) (Rev 1)',
      identifiedBy: 'crc'
    })
  })

  it('identifies an arcade game by its archive’s name', async () => {
    const { database } = provider([GAME_BOY, ARCADE])

    expect(
      await database.identify({ platformId: 'fb_alpha', filePath: '/roms/arcade/kof2002.zip' })
    ).toMatchObject({ name: 'The King of Fighters 2002 (NGM-2650 ~ NGH-2650)' })
  })

  it('doesn’t look in other platforms’ databases', async () => {
    const { database } = provider([GAME_BOY, ARCADE])

    expect(
      await database.identify({ platformId: 'game_boy', filePath: '/roms/arcade/kof2002.zip' })
    ).toBeNull()
  })

  it('can’t look without a database it can read for the platform, so the game is asked again', async () => {
    const game = { platformId: 'game_boy', filePath: '/roms/gb/my tetris.gb' }
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const broken = { ...FILES, [GAME_BOY.path]: Buffer.from('broken') }

    await expect(provider([]).database.identify(game)).rejects.toThrow(MetadataUnavailableError)
    await expect(provider([ARCADE]).database.identify(game)).rejects.toThrow(
      MetadataUnavailableError
    )
    await expect(provider([GAME_BOY], broken).database.identify(game)).rejects.toThrow(
      MetadataUnavailableError
    )
    await expect(
      provider([{ ...GAME_BOY, path: '/missing.rdb' }]).database.identify(game)
    ).rejects.toThrow(MetadataUnavailableError)
  })

  it('identifies nothing when its databases don’t have the game', async () => {
    const { database } = provider([GAME_BOY], { ...FILES, '/roms/gb/other.gb': Buffer.alloc(8) })

    expect(
      await database.identify({ platformId: 'game_boy', filePath: '/roms/gb/other.gb' })
    ).toBeNull()
  })

  it('gives the details of a game it identified', async () => {
    const { database } = provider([GAME_BOY])
    const identity = await database.identify({
      platformId: 'game_boy',
      filePath: '/roms/gb/my tetris.gb'
    })

    expect(identity && (await database.details(identity))).toEqual({
      title: 'Tetris',
      releaseYear: 1989,
      releaseMonth: null,
      developer: 'Nintendo',
      publisher: 'Nintendo',
      genre: 'Puzzle',
      players: 2
    })
  })

  it('gives no details for a game or a database it doesn’t have', async () => {
    const { database } = provider([GAME_BOY])
    const identity = {
      providerId: 'libretro-database' as const,
      database: 'Nintendo - Game Boy',
      name: 'Missing (USA)',
      identifiedBy: 'crc' as const
    }

    expect(await database.details(identity)).toBeNull()
    expect(await database.details({ ...identity, database: 'Sega - Saturn' })).toBeNull()
  })

  it('asks for the database files once while it lives', async () => {
    const { database, listDatabases } = provider([GAME_BOY])
    const game = { platformId: 'game_boy', filePath: '/roms/gb/my tetris.gb' }

    await database.identify(game)
    await database.identify(game)

    expect(listDatabases).toHaveBeenCalledTimes(1)
  })
})
