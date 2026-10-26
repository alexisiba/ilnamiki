import type { DatabaseSync } from 'node:sqlite'

import { transaction } from './transaction'

/** A change to the database schema. Once released, a migration is never edited: add another. */
export interface Migration {
  /** Its place in the history: 1 for the first, each one after the previous. */
  version: number
  /** What it changes, e.g. "Create the emulators table". */
  name: string
  /** SQL statements applied, in order, to a database older than `version`. */
  up: string
}

/** The schema version of `db`, which SQLite keeps in the database file itself (0 when new). */
export function getSchemaVersion(db: DatabaseSync): number {
  const row = db.prepare('PRAGMA user_version').get() as { user_version: number }
  return row.user_version
}

/**
 * Brings `db` up to the latest of `migrations`, applying each one it doesn't have yet in a
 * transaction of its own, so one that fails leaves the database as the previous one did.
 * Throws when the migrations are out of order, or when the database comes from a newer
 * version of the app, which this one can't know how to read.
 */
export function migrate(db: DatabaseSync, migrations: Migration[]): void {
  migrations.forEach((migration, index) => {
    if (migration.version !== index + 1) {
      throw new Error(
        `Migration "${migration.name}" has version ${migration.version}, expected ${index + 1}`
      )
    }
  })

  const currentVersion = getSchemaVersion(db)
  if (currentVersion > migrations.length) {
    throw new Error(
      `The database is at version ${currentVersion}, newer than this app's ${migrations.length}`
    )
  }

  for (const migration of migrations.slice(currentVersion)) {
    transaction(db, () => {
      db.exec(migration.up)
      // PRAGMA takes no parameters; the version is an integer checked above.
      db.exec(`PRAGMA user_version = ${migration.version}`)
    })
  }
}
