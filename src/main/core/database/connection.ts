import type { DatabaseSync } from 'node:sqlite'
import { join } from 'path'

import { openDatabase } from './database'

const DATABASE_FILE_NAME = 'ilnamiki.db'

let connection: DatabaseSync | undefined

/**
 * Opens the app's database in `directory` (the app's user data folder) and brings it up to
 * date. Called once, at startup, before any feature uses it. Throws like `openDatabase`.
 */
export function initDatabase(directory: string): void {
  if (connection) throw new Error('The database is already open')
  connection = openDatabase(join(directory, DATABASE_FILE_NAME))
}

/** The app's database, for main's features. Throws when it isn't open. */
export function getDatabase(): DatabaseSync {
  if (!connection) throw new Error('The database is not open')
  return connection
}

/** Closes the app's database, when it is open, as the app quits. */
export function closeDatabase(): void {
  connection?.close()
  connection = undefined
}
