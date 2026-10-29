import type { DatabaseSync } from 'node:sqlite'
import { afterEach, describe, expect, it } from 'vitest'

import { openDatabase } from '../database'
import { migrate } from '../migrate'
import { MIGRATIONS } from '.'

let db: DatabaseSync | undefined

afterEach(() => {
  db?.close()
  db = undefined
})

/** A database at `version`, with a folder and the games g1, g2 and g3 in it. */
function databaseAt(version: number): DatabaseSync {
  const database = openDatabase(':memory:', MIGRATIONS.slice(0, version))
  database.exec(`
    INSERT INTO library_folders (id, path, platform_id, created_at, updated_at)
      VALUES ('f1', '/roms/psx', 'playstation', 1, 1);
    INSERT INTO games (id, folder_id, platform_id, file_path, title, added_at) VALUES
      ('g1', 'f1', 'playstation', '/roms/psx/gex.cue', 'Gex', 1),
      ('g2', 'f1', 'playstation', '/roms/psx/crash.cue', 'Crash', 1),
      ('g3', 'f1', 'playstation', '/roms/psx/mgs.cue', 'MGS', 1);
  `)
  return database
}

const insertMetadata = (database: DatabaseSync, gameId: string, identifiedBy: string): void => {
  database
    .prepare(
      `INSERT INTO game_metadata (game_id, identity_provider, identity_database, identity_name,
          identified_by, title, file_size, file_modified_at, looked_at)
        VALUES (?, 'libretro-database', 'Sony - PlayStation', ?, ?, ?, 10, 20, 30)`
    )
    .run(gameId, `${gameId} (USA)`, identifiedBy, gameId)
}

describe('migration 8', () => {
  it('keeps the games that were identified', () => {
    db = databaseAt(7)
    insertMetadata(db, 'g1', 'file-name')

    migrate(db, MIGRATIONS)

    expect(db.prepare('SELECT * FROM game_metadata').all()).toEqual([
      {
        game_id: 'g1',
        identity_provider: 'libretro-database',
        identity_database: 'Sony - PlayStation',
        identity_name: 'g1 (USA)',
        identified_by: 'file-name',
        title: 'g1',
        release_year: null,
        release_month: null,
        developer: null,
        publisher: null,
        genre: null,
        players: null,
        file_size: 10,
        file_modified_at: 20,
        looked_at: 30
      }
    ])
  })

  it('leaves out the games nobody identified, so they are asked again', () => {
    db = databaseAt(7)
    insertMetadata(db, 'g1', 'crc')
    db.prepare(
      `INSERT INTO game_metadata (game_id, file_size, file_modified_at, looked_at)
        VALUES ('g2', 10, 20, 30)`
    ).run()

    migrate(db, MIGRATIONS)

    expect(db.prepare('SELECT game_id FROM game_metadata').all()).toEqual([{ game_id: 'g1' }])
  })

  it('accepts games identified by serial, and nothing else new', () => {
    db = databaseAt(MIGRATIONS.length)

    insertMetadata(db, 'g1', 'serial')
    expect(() => insertMetadata(db!, 'g2', 'title')).toThrow(/CHECK/)
  })

  it('still deletes a game’s metadata with the game', () => {
    db = databaseAt(MIGRATIONS.length)
    insertMetadata(db, 'g3', 'serial')

    db.prepare("DELETE FROM games WHERE id = 'g3'").run()

    expect(db.prepare('SELECT * FROM game_metadata').all()).toEqual([])
  })
})
