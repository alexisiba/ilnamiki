import { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { FAILING_MIGRATION, TEST_MIGRATIONS } from './database.fixtures'
import { getSchemaVersion, migrate } from './migrate'

let db: DatabaseSync

const TABLE_NAMES_QUERY = "SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name"

const tableNames = (): string[] =>
  (db.prepare(TABLE_NAMES_QUERY).all() as { name: string }[]).map(({ name }) => name)

beforeEach(() => {
  db = new DatabaseSync(':memory:')
})

afterEach(() => {
  db.close()
})

describe('migrate', () => {
  it('starts a new database at version 0', () => {
    expect(getSchemaVersion(db)).toBe(0)
  })

  it('applies every migration to a new database, in order', () => {
    migrate(db, TEST_MIGRATIONS)

    expect(getSchemaVersion(db)).toBe(3)
    expect(tableNames()).toEqual(['consoles', 'games'])
    expect(db.prepare('SELECT title FROM games ORDER BY id').all()).toEqual([
      { title: 'Metal Gear Solid' },
      { title: 'The Legend of Zelda: Ocarina of Time' }
    ])
  })

  it('applies only the migrations a database does not have yet', () => {
    migrate(db, TEST_MIGRATIONS.slice(0, 2))
    expect(getSchemaVersion(db)).toBe(2)

    migrate(db, TEST_MIGRATIONS)

    expect(getSchemaVersion(db)).toBe(3)
    expect(db.prepare('SELECT COUNT(*) AS count FROM consoles').get()).toEqual({ count: 2 })
  })

  it('does nothing to a database that is up to date', () => {
    migrate(db, TEST_MIGRATIONS)

    // Seeding again would break the primary keys.
    expect(() => migrate(db, TEST_MIGRATIONS)).not.toThrow()
    expect(getSchemaVersion(db)).toBe(3)
  })

  it('leaves the database as it was when a migration fails', () => {
    migrate(db, TEST_MIGRATIONS)

    expect(() => migrate(db, [...TEST_MIGRATIONS, FAILING_MIGRATION])).toThrow()

    expect(getSchemaVersion(db)).toBe(3)
    expect(tableNames()).toEqual(['consoles', 'games'])
    expect(db.isTransaction).toBe(false)
  })

  it('keeps the migrations applied before the one that fails', () => {
    const failingSecond = { ...FAILING_MIGRATION, version: 2 }

    expect(() => migrate(db, [TEST_MIGRATIONS[0], failingSecond])).toThrow()

    expect(getSchemaVersion(db)).toBe(1)
    expect(tableNames()).toEqual(['consoles'])
  })

  it('refuses migrations that are out of order, applying none', () => {
    const outOfOrder = [TEST_MIGRATIONS[0], TEST_MIGRATIONS[2]]

    expect(() => migrate(db, outOfOrder)).toThrow(/version 3, expected 2/)
    expect(getSchemaVersion(db)).toBe(0)
  })

  it('refuses a database from a newer version of the app', () => {
    migrate(db, TEST_MIGRATIONS)

    expect(() => migrate(db, TEST_MIGRATIONS.slice(0, 2))).toThrow(/version 3, newer/)
  })
})
