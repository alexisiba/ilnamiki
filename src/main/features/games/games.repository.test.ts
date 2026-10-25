import type { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { openDatabase } from '../../core/database'
import { createGamesRepository } from './games.repository'

let db: DatabaseSync

beforeEach(() => {
  // The app's real migrations, on a database that lives only in memory.
  db = openDatabase(':memory:')
  db.prepare(
    `INSERT INTO library_folders (id, path, platform_id, created_at, updated_at)
      VALUES ('f1', '/home/player/Games/PS1', 'playstation', 1, 1)`
  ).run()
  const insert = db.prepare(
    `INSERT INTO games (id, folder_id, platform_id, file_path, title, added_at, removed_at)
      VALUES (?, ?, 'playstation', ?, 'Game', 1, ?)`
  )
  insert.run('g1', 'f1', '/home/player/Games/PS1/Crash.cue', null)
  insert.run('g2', null, '/home/player/Games/PS1/Tekken 3.chd', 2)
})

afterEach(() => {
  db.close()
})

describe('games repository', () => {
  it('finds a game in a folder with its platform and file', () => {
    expect(createGamesRepository(db).findPlayable('g1')).toEqual({
      id: 'g1',
      platformId: 'playstation',
      filePath: '/home/player/Games/PS1/Crash.cue'
    })
  })

  it('finds no removed or unknown game', () => {
    const repository = createGamesRepository(db)

    expect(repository.findPlayable('g2')).toBeUndefined()
    expect(repository.findPlayable('missing')).toBeUndefined()
  })
})
