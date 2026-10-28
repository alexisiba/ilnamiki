import type { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { openDatabase } from '../database'
import type { DescribedGame, MetadataUpdate } from './gameMetadata.describe'
import { type FoundArtwork, NO_DETAILS } from './gameMetadata.fallback'
import { createGameMetadataRepository } from './gameMetadata.repository'

const TETRIS: DescribedGame = {
  gameId: 'g1',
  identity: {
    providerId: 'libretro-database',
    database: 'Nintendo - Game Boy',
    name: 'Tetris (World) (Rev 1)',
    identifiedBy: 'crc'
  },
  details: {
    title: 'Tetris',
    releaseYear: 1989,
    releaseMonth: 6,
    developer: 'Nintendo',
    publisher: 'Nintendo',
    genre: 'Puzzle',
    players: 2
  },
  file: { size: 32768, modifiedAt: 1000 }
}

const UNKNOWN: DescribedGame = {
  gameId: 'g2',
  identity: null,
  details: NO_DETAILS,
  file: { size: 4096, modifiedAt: 2000 }
}

const TETRIS_ARTWORK: FoundArtwork[] = [
  { kind: 'cover', path: '/data/artwork/g1/cover.png' },
  { kind: 'title-screen', path: null },
  { kind: 'screenshot', path: '/data/artwork/g1/screenshot.png' }
]

const details = (game: DescribedGame): MetadataUpdate => ({ type: 'details', game })
const artwork = (gameId: string, found: FoundArtwork[]): MetadataUpdate => ({
  type: 'artwork',
  gameId,
  artwork: found
})

let db: DatabaseSync

beforeEach(() => {
  // The app's real migrations, on a database that lives only in memory.
  db = openDatabase(':memory:')
  db.prepare(
    `INSERT INTO library_folders (id, path, platform_id, created_at, updated_at)
      VALUES ('f1', '/home/player/Games/GB', 'game_boy', 1, 1),
        ('f2', '/home/player/Games/N64', 'nintendo_64', 1, 1)`
  ).run()
  const insert = db.prepare(
    `INSERT INTO games (id, folder_id, platform_id, file_path, title, added_at, removed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
  insert.run('g1', 'f1', 'game_boy', '/home/player/Games/GB/tetris.gb', 'tetris', 1, null)
  insert.run('g2', 'f1', 'game_boy', '/home/player/Games/GB/homebrew.gb', 'homebrew', 2, null)
  insert.run('g3', 'f2', 'nintendo_64', '/home/player/Games/N64/sm64.z64', 'sm64', 3, null)
  insert.run('g4', null, 'game_boy', '/home/player/Games/GB/gone.gb', 'gone', 4, 5)
})

afterEach(() => {
  db.close()
})

const imageRows = (): unknown[] =>
  db
    .prepare('SELECT game_id, kind, path, looked_at FROM game_images ORDER BY game_id, kind')
    .all()
    .map((row) => ({ ...row }))

describe('game metadata repository', () => {
  it('lists the games of every folder to describe, oldest first, leaving removed ones out', () => {
    expect(createGameMetadataRepository(db).listGamesToDescribe(null)).toEqual([
      {
        id: 'g1',
        platformId: 'game_boy',
        filePath: '/home/player/Games/GB/tetris.gb',
        lookedAtFile: null,
        identity: null,
        isArtworkAsked: false
      },
      {
        id: 'g2',
        platformId: 'game_boy',
        filePath: '/home/player/Games/GB/homebrew.gb',
        lookedAtFile: null,
        identity: null,
        isArtworkAsked: false
      },
      {
        id: 'g3',
        platformId: 'nintendo_64',
        filePath: '/home/player/Games/N64/sm64.z64',
        lookedAtFile: null,
        identity: null,
        isArtworkAsked: false
      }
    ])
  })

  it('lists only the games of the folders asked for', () => {
    const repository = createGameMetadataRepository(db)

    expect(repository.listGamesToDescribe(['f2']).map(({ id }) => id)).toEqual(['g3'])
    expect(repository.listGamesToDescribe([])).toEqual([])
  })

  it('keeps what was found, for the next run to compare and to look for artwork with', () => {
    const repository = createGameMetadataRepository(db)
    repository.save([details(TETRIS), details(UNKNOWN)], 50)

    expect(repository.listGamesToDescribe(['f1'])).toMatchObject([
      { id: 'g1', lookedAtFile: TETRIS.file, identity: TETRIS.identity, isArtworkAsked: false },
      { id: 'g2', lookedAtFile: UNKNOWN.file, identity: null, isArtworkAsked: false }
    ])
    expect(db.prepare("SELECT * FROM game_metadata WHERE game_id = 'g1'").get()).toEqual({
      game_id: 'g1',
      identity_provider: 'libretro-database',
      identity_database: 'Nintendo - Game Boy',
      identity_name: 'Tetris (World) (Rev 1)',
      identified_by: 'crc',
      title: 'Tetris',
      release_year: 1989,
      release_month: 6,
      developer: 'Nintendo',
      publisher: 'Nintendo',
      genre: 'Puzzle',
      players: 2,
      file_size: 32768,
      file_modified_at: 1000,
      looked_at: 50
    })
  })

  it('keeps a game no provider knew, so it isn’t asked again', () => {
    createGameMetadataRepository(db).save([details(UNKNOWN)], 50)

    expect(db.prepare("SELECT * FROM game_metadata WHERE game_id = 'g2'").get()).toMatchObject({
      identity_provider: null,
      identified_by: null,
      title: null,
      file_size: 4096
    })
  })

  it('replaces what was found about a game when it is described again', () => {
    const repository = createGameMetadataRepository(db)
    repository.save([details(TETRIS)], 50)
    repository.save([details({ ...UNKNOWN, gameId: 'g1' })], 60)

    expect(
      db.prepare("SELECT title, file_size, looked_at FROM game_metadata WHERE game_id = 'g1'").get()
    ).toEqual({ title: null, file_size: 4096, looked_at: 60 })
  })

  it('keeps every artwork kind asked, with its file or none, and then has it all asked', () => {
    const repository = createGameMetadataRepository(db)
    repository.save([details(TETRIS), artwork('g1', TETRIS_ARTWORK)], 50)

    expect(imageRows()).toEqual([
      { game_id: 'g1', kind: 'cover', path: '/data/artwork/g1/cover.png', looked_at: 50 },
      { game_id: 'g1', kind: 'screenshot', path: '/data/artwork/g1/screenshot.png', looked_at: 50 },
      { game_id: 'g1', kind: 'title_screen', path: null, looked_at: 50 }
    ])
    expect(repository.listGamesToDescribe(['f1'])[0].isArtworkAsked).toBe(true)
  })

  it('forgets a game’s artwork when it is described again, to find it for its new identity', () => {
    const repository = createGameMetadataRepository(db)
    repository.save([details(TETRIS), artwork('g1', TETRIS_ARTWORK)], 50)
    repository.save([details({ ...TETRIS, file: { size: 1, modifiedAt: 1 } })], 60)

    expect(imageRows()).toEqual([])
    expect(repository.listGamesToDescribe(['f1'])[0].isArtworkAsked).toBe(false)
  })

  it('refuses metadata of an unknown game, a half identity or values that can’t be right', () => {
    const repository = createGameMetadataRepository(db)

    expect(() => repository.save([details({ ...TETRIS, gameId: 'missing' })], 50)).toThrow(
      /FOREIGN KEY/
    )
    expect(() => repository.save([artwork('missing', TETRIS_ARTWORK)], 50)).toThrow(/FOREIGN KEY/)
    expect(() =>
      db
        .prepare(
          `INSERT INTO game_metadata (game_id, identity_provider, file_size, file_modified_at,
              looked_at)
            VALUES ('g1', 'libretro-database', 1, 1, 1)`
        )
        .run()
    ).toThrow(/CHECK/)
    expect(() =>
      repository.save(
        [details({ ...TETRIS, details: { ...TETRIS.details, releaseMonth: 13 } })],
        50
      )
    ).toThrow(/CHECK/)
    expect(() =>
      repository.save([details({ ...TETRIS, details: { ...TETRIS.details, title: '' } })], 50)
    ).toThrow(/CHECK/)
    expect(() => repository.save([artwork('g1', [{ kind: 'cover', path: '' }])], 50)).toThrow(
      /CHECK/
    )
  })
})
