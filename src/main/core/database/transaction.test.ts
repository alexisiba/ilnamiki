import { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { transaction } from './transaction'

let db: DatabaseSync

const consoleNames = (): string[] =>
  (db.prepare('SELECT name FROM consoles ORDER BY name').all() as { name: string }[]).map(
    ({ name }) => name
  )

beforeEach(() => {
  db = new DatabaseSync(':memory:')
  db.exec('CREATE TABLE consoles (name TEXT PRIMARY KEY) STRICT')
})

afterEach(() => {
  db.close()
})

describe('transaction', () => {
  it('keeps every change when the work succeeds, and returns its result', () => {
    const result = transaction(db, () => {
      db.prepare('INSERT INTO consoles (name) VALUES (?)').run('NES')
      db.prepare('INSERT INTO consoles (name) VALUES (?)').run('SNES')
      return 'done'
    })

    expect(result).toBe('done')
    expect(consoleNames()).toEqual(['NES', 'SNES'])
    expect(db.isTransaction).toBe(false)
  })

  it('undoes every change and throws again when the work fails', () => {
    expect(() =>
      transaction(db, () => {
        db.prepare('INSERT INTO consoles (name) VALUES (?)').run('NES')
        throw new Error('Something went wrong')
      })
    ).toThrow('Something went wrong')

    expect(consoleNames()).toEqual([])
    expect(db.isTransaction).toBe(false)
  })
})
