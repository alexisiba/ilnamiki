import type { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { openDatabase } from '../../core/database'
import { createLibraryRepository, type FolderRecord } from './library.repository'

const PS1_FOLDER: FolderRecord = {
  id: 'f1',
  path: '/home/player/Games/PS1',
  platformId: 'playstation',
  createdAt: 1_800_000_000_000,
  updatedAt: 1_800_000_000_000
}

const N64_FOLDER: FolderRecord = {
  id: 'f2',
  path: '/home/player/Games/N64',
  platformId: 'nintendo_64',
  createdAt: 1_800_000_000_001,
  updatedAt: 1_800_000_000_001
}

const CRASH = { id: 'g1', filePath: '/home/player/Games/PS1/Crash.cue', title: 'Crash' }
const TEKKEN = { id: 'g2', filePath: '/home/player/Games/PS1/Tekken 3.chd', title: 'Tekken 3' }

let db: DatabaseSync

beforeEach(() => {
  // The app's real migrations, on a database that lives only in memory.
  db = openDatabase(':memory:')
})

afterEach(() => {
  db.close()
})

const gameRows = (): unknown[] =>
  db
    .prepare('SELECT id, folder_id, title, removed_at FROM games ORDER BY id')
    .all()
    .map((row) => ({ ...row }))

describe('library repository', () => {
  it('starts with no folders', () => {
    expect(createLibraryRepository(db).listFolders()).toEqual([])
  })

  it('keeps the folders it is given, oldest first, with their game count', () => {
    const repository = createLibraryRepository(db)
    repository.insertFolder(N64_FOLDER)
    repository.insertFolder(PS1_FOLDER)
    repository.saveGames(PS1_FOLDER.id, 'playstation', [CRASH, TEKKEN], 1_800_000_000_100)

    expect(repository.listFolders()).toEqual([
      { ...PS1_FOLDER, gameCount: 2 },
      { ...N64_FOLDER, gameCount: 0 }
    ])
  })

  it('finds a folder by its id, path and platform', () => {
    const repository = createLibraryRepository(db)
    repository.insertFolder(PS1_FOLDER)

    expect(repository.findFolderById('f1')?.path).toBe(PS1_FOLDER.path)
    expect(repository.findFolderByPath(PS1_FOLDER.path)?.id).toBe('f1')
    expect(repository.findFolderByPlatform('playstation')?.id).toBe('f1')
    expect(repository.findFolderByPlatform('nintendo_64')).toBeUndefined()
  })

  it('refuses a second folder at the same path or for the same platform', () => {
    const repository = createLibraryRepository(db)
    repository.insertFolder(PS1_FOLDER)

    expect(() => repository.insertFolder({ ...N64_FOLDER, path: PS1_FOLDER.path })).toThrow(
      /UNIQUE/
    )
    expect(() => repository.insertFolder({ ...N64_FOLDER, platformId: 'playstation' })).toThrow(
      /UNIQUE/
    )
  })

  it('brings a removed game back with its id when the same file is saved again', () => {
    const repository = createLibraryRepository(db)
    repository.insertFolder(PS1_FOLDER)
    db.prepare(
      `INSERT INTO games (id, folder_id, platform_id, file_path, title, added_at, removed_at)
        VALUES ('old', NULL, 'playstation', ?, 'Crash (old name)', 1, 2)`
    ).run(CRASH.filePath)

    repository.saveGames(PS1_FOLDER.id, 'playstation', [CRASH], 1_800_000_000_100)

    expect(gameRows()).toEqual([{ id: 'old', folder_id: 'f1', title: 'Crash', removed_at: null }])
  })

  it('keeps games of different platforms with the same file apart', () => {
    const repository = createLibraryRepository(db)
    repository.insertFolder(PS1_FOLDER)
    repository.insertFolder(N64_FOLDER)

    repository.saveGames(PS1_FOLDER.id, 'playstation', [CRASH], 1)
    repository.saveGames(N64_FOLDER.id, 'nintendo_64', [{ ...CRASH, id: 'g3' }], 1)

    expect(gameRows()).toHaveLength(2)
  })

  it('refuses to delete a folder until its games are marked removed', () => {
    const repository = createLibraryRepository(db)
    repository.insertFolder(PS1_FOLDER)
    repository.saveGames(PS1_FOLDER.id, 'playstation', [CRASH], 1)
    const deleteFolder = (): unknown =>
      db.prepare('DELETE FROM library_folders WHERE id = ?').run(PS1_FOLDER.id)

    expect(deleteFolder).toThrow(/FOREIGN KEY/)

    db.prepare('UPDATE games SET folder_id = NULL, removed_at = 2').run()
    deleteFolder()

    expect(gameRows()).toEqual([{ id: 'g1', folder_id: null, title: 'Crash', removed_at: 2 }])
  })

  it('refuses a game in a folder marked removed, or out of every folder and not removed', () => {
    const repository = createLibraryRepository(db)
    repository.insertFolder(PS1_FOLDER)
    const insert = db.prepare(
      `INSERT INTO games (id, folder_id, platform_id, file_path, title, added_at, removed_at)
        VALUES (?, ?, 'playstation', ?, 'Crash', 1, ?)`
    )

    expect(() => insert.run('a', 'f1', '/a.cue', 2)).toThrow(/CHECK/)
    expect(() => insert.run('b', null, '/b.cue', null)).toThrow(/CHECK/)
  })
})
