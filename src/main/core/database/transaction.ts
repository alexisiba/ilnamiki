import type { DatabaseSync } from 'node:sqlite'

/**
 * Runs `work` in a transaction of `db` and returns what it returns: committed when `work`
 * returns, rolled back when it throws (the error is thrown again). Transactions don't nest:
 * `work` must not start another one.
 */
export function transaction<T>(db: DatabaseSync, work: () => T): T {
  db.exec('BEGIN IMMEDIATE')
  try {
    const result = work()
    db.exec('COMMIT')
    return result
  } catch (error) {
    if (db.isTransaction) db.exec('ROLLBACK')
    throw error
  }
}
