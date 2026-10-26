import type { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { openDatabase } from '../../core/database'
import { createGamesRepository, type PlaySessionRecord } from './games.repository'

const MINUTE_MS = 60 * 1000

/** A session of `game` with RetroArch's Beetle PSX, `minutes` long, ending at `endedAt`. */
const session = (
  id: string,
  gameId: string,
  endedAt: number,
  minutes: number
): PlaySessionRecord => ({
  id,
  gameId,
  emulatorId: 'e1',
  core: 'mednafen_psx_hw',
  startedAt: endedAt - minutes * MINUTE_MS,
  endedAt,
  createdAt: endedAt
})

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
  insert.run('g3', 'f1', '/home/player/Games/PS1/Spyro.cue', null)
  db.prepare(
    `INSERT INTO emulators (id, kind, name, executable_path, created_at, updated_at)
      VALUES ('e1', 'retroarch', 'RetroArch', '/home/player/RetroArch.AppImage', 1, 1)`
  ).run()
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

  it('finds the emulator and core a game was last played with', () => {
    db.prepare(
      `INSERT INTO emulators (id, kind, name, executable_path, created_at, updated_at)
        VALUES ('e2', 'retroarch', 'RetroArch Nightly', '/home/player/Nightly.AppImage', 1, 1)`
    ).run()
    const repository = createGamesRepository(db)
    repository.addPlaySession(session('s1', 'g1', 1_000 * MINUTE_MS, 30))
    repository.addPlaySession({
      ...session('s2', 'g1', 3_000 * MINUTE_MS, 30),
      emulatorId: 'e2',
      core: 'swanstation'
    })
    repository.addPlaySession(session('s3', 'g3', 4_000 * MINUTE_MS, 30))

    expect(repository.findLastPlayer('g1')).toEqual({ emulatorId: 'e2', core: 'swanstation' })
  })

  it('finds no last player for a game never played, or whose emulator was deleted', () => {
    const repository = createGamesRepository(db)
    repository.addPlaySession(session('s1', 'g1', 1_000 * MINUTE_MS, 30))

    expect(repository.findLastPlayer('g3')).toBeUndefined()
    db.prepare("DELETE FROM emulators WHERE id = 'e1'").run()
    expect(repository.findLastPlayer('g1')).toBeUndefined()
  })

  it('lists the games added last, newest first and those added together by title', () => {
    const insert = db.prepare(
      `INSERT INTO games (id, folder_id, platform_id, file_path, title, added_at, removed_at)
        VALUES (?, 'f1', 'playstation', ?, ?, ?, NULL)`
    )
    insert.run('g4', '/home/player/Games/PS1/Tekken.cue', 'tekken', 5)
    insert.run('g5', '/home/player/Games/PS1/Ape Escape.cue', 'Ape Escape', 5)
    insert.run('g6', '/home/player/Games/PS1/Medievil.cue', 'MediEvil', 3)

    expect(createGamesRepository(db).listRecentlyAdded(10)).toEqual([
      { id: 'g5', title: 'Ape Escape', platformId: 'playstation', addedAt: 5 },
      { id: 'g4', title: 'tekken', platformId: 'playstation', addedAt: 5 },
      { id: 'g6', title: 'MediEvil', platformId: 'playstation', addedAt: 3 },
      { id: 'g1', title: 'Game', platformId: 'playstation', addedAt: 1 },
      { id: 'g3', title: 'Game', platformId: 'playstation', addedAt: 1 }
    ])
  })

  it('lists at most as many recently added games as asked, leaving removed ones out', () => {
    const repository = createGamesRepository(db)

    expect(repository.listRecentlyAdded(1).map(({ id }) => id)).toEqual(['g1'])
    expect(repository.listRecentlyAdded(10).map(({ id }) => id)).not.toContain('g2')
  })

  it('finds no last played game while none was played', () => {
    expect(createGamesRepository(db).findLastPlayed()).toBeNull()
  })

  it('finds the game whose session ended last, with its total playtime', () => {
    const repository = createGamesRepository(db)
    repository.addPlaySession(session('s1', 'g1', 1_000 * MINUTE_MS, 30))
    repository.addPlaySession(session('s2', 'g3', 2_000 * MINUTE_MS, 15))
    repository.addPlaySession(session('s3', 'g1', 3_000 * MINUTE_MS, 45))

    expect(repository.findLastPlayed()).toEqual({
      id: 'g1',
      title: 'Game',
      platformId: 'playstation',
      lastPlayedAt: 3_000 * MINUTE_MS,
      playtimeMs: 75 * MINUTE_MS
    })
  })

  it('leaves removed games out of the last played', () => {
    const repository = createGamesRepository(db)
    repository.addPlaySession(session('s1', 'g1', 1_000 * MINUTE_MS, 30))
    repository.addPlaySession(session('s2', 'g2', 2_000 * MINUTE_MS, 30))

    expect(repository.findLastPlayed()?.id).toBe('g1')
  })

  it('keeps a session without a core, for emulators that have none', () => {
    const repository = createGamesRepository(db)
    repository.addPlaySession({ ...session('s1', 'g1', 1_000 * MINUTE_MS, 30), core: null })

    expect(db.prepare("SELECT core FROM play_sessions WHERE id = 's1'").get()).toEqual({
      core: null
    })
  })

  it('refuses a session of an unknown game, or that ends before it starts', () => {
    const repository = createGamesRepository(db)

    expect(() =>
      repository.addPlaySession(session('s1', 'missing', 1_000 * MINUTE_MS, 30))
    ).toThrow(/FOREIGN KEY/)
    expect(() => repository.addPlaySession(session('s2', 'g1', 1_000 * MINUTE_MS, -1))).toThrow(
      /CHECK/
    )
  })

  it('keeps the sessions of an emulator that is deleted, without it', () => {
    const repository = createGamesRepository(db)
    repository.addPlaySession(session('s1', 'g1', 1_000 * MINUTE_MS, 30))

    db.prepare("DELETE FROM emulators WHERE id = 'e1'").run()

    expect(db.prepare("SELECT emulator_id, core FROM play_sessions WHERE id = 's1'").get()).toEqual(
      { emulator_id: null, core: 'mednafen_psx_hw' }
    )
    expect(repository.findLastPlayed()?.playtimeMs).toBe(30 * MINUTE_MS)
  })

  it('refuses to delete a game that was played', () => {
    createGamesRepository(db).addPlaySession(session('s1', 'g1', 1_000 * MINUTE_MS, 30))

    expect(() => db.prepare("DELETE FROM games WHERE id = 'g1'").run()).toThrow(/FOREIGN KEY/)
  })
})
