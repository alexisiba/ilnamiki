import type { DatabaseSync } from 'node:sqlite'
import { afterEach, describe, expect, it } from 'vitest'

import { FAILING_MIGRATION, TEST_MIGRATIONS } from './database.fixtures'
import { openDatabase } from './database'
import { getSchemaVersion } from './migrate'

let db: DatabaseSync | undefined

afterEach(() => {
  db?.close()
  db = undefined
})

describe('openDatabase', () => {
  it('opens the database with its schema up to date', () => {
    db = openDatabase(':memory:', TEST_MIGRATIONS)

    expect(getSchemaVersion(db)).toBe(3)
    expect(db.prepare("SELECT name FROM consoles WHERE id = 'n64'").get()).toEqual({
      name: 'Nintendo 64'
    })
  })

  it('enforces foreign keys', () => {
    db = openDatabase(':memory:', TEST_MIGRATIONS)
    const insertGame = db.prepare('INSERT INTO games (id, title, console_id) VALUES (?, ?, ?)')

    expect(() => insertGame.run('halo', 'Halo', 'xbox')).toThrow(/FOREIGN KEY/)
  })

  it('throws when a migration fails', () => {
    expect(() => openDatabase(':memory:', [...TEST_MIGRATIONS, FAILING_MIGRATION])).toThrow()
  })

  it('opens an empty database with the app’s migrations', () => {
    db = openDatabase(':memory:')

    expect(getSchemaVersion(db)).toBe(0)
  })
})
