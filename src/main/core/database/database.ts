import { DatabaseSync } from 'node:sqlite'

import { migrate, type Migration } from './migrate'
import { MIGRATIONS } from './migrations'

/** How long a write waits for another one holding the database before failing. */
const BUSY_TIMEOUT_MS = 5000

/**
 * Opens the SQLite database at `filePath`, creating it when missing (`':memory:'` opens one
 * that lives only in memory, e.g. for tests), and brings its schema up to date with
 * `migrations`. Foreign keys are enforced. Throws, leaving nothing open, when the file can't
 * be opened or a migration fails.
 */
export function openDatabase(filePath: string, migrations: Migration[] = MIGRATIONS): DatabaseSync {
  const db = new DatabaseSync(filePath, {
    enableForeignKeyConstraints: true,
    timeout: BUSY_TIMEOUT_MS
  })

  try {
    // Readers don't wait for writers, and a crash mid-write can't corrupt the file. In-memory
    // databases keep their own journal mode.
    db.exec('PRAGMA journal_mode = WAL')
    migrate(db, migrations)
  } catch (error) {
    db.close()
    throw error
  }

  return db
}
