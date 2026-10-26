import type { DatabaseSync } from 'node:sqlite'

import type { CoreRef, GameDetails, LastPlayedGame, RecentlyAddedGame } from '@shared/api'

/** A game in a folder, with what it takes to play it. */
export interface PlayableGameRecord {
  id: string
  platformId: string
  /** Absolute path of the file the emulator opens. */
  filePath: string
  /** The core the user chose for it; null while they chose none or its emulator is gone. */
  chosenCore: CoreRef | null
}

/** A time a game was played, from when its emulator started until it closed. */
export interface PlaySessionRecord {
  id: string
  gameId: string
  emulatorId: string
  /** Core it was played with, e.g. "mupen64plus_next"; null for emulators without cores. */
  core: string | null
  /** Epoch ms. */
  startedAt: number
  /** Epoch ms. */
  endedAt: number
  /** When the session was saved, in epoch ms. */
  createdAt: number
}

/** The emulator, and its core, a game was played with. */
export interface GamePlayerRecord {
  emulatorId: string
  /** e.g. "mupen64plus_next"; null for emulators without cores. */
  core: string | null
}

export interface GamesRepository {
  /** The game `id` while it is in a folder; removed games can't be played. */
  findPlayable(id: string): PlayableGameRecord | undefined
  /** Every game in a folder, of every platform; removed games can't be played. */
  listPlayable(): PlayableGameRecord[]
  /** Keeps the core the game `id` plays with, or forgets it with null. */
  setChosenCore(id: string, core: CoreRef | null): void
  /**
   * The emulator and core the game `gameId` was last played with, or undefined when it was
   * never played with an emulator the user still has.
   */
  findLastPlayer(gameId: string): GamePlayerRecord | undefined
  /**
   * The game in a folder played most recently, or null when none was played; games of a
   * platform turned off are left out.
   */
  findLastPlayed(): LastPlayedGame | null
  /**
   * The `limit` games in a folder added last, newest first; games added together by title.
   * Games of a platform turned off are left out.
   */
  listRecentlyAdded(limit: number): RecentlyAddedGame[]
  /** The game `id` while it is in a folder, with its play history; null otherwise. */
  findDetails(id: string): GameDetails | null
  addPlaySession(session: PlaySessionRecord): void
}

interface LastPlayedRow {
  id: string
  title: string
  platform_id: string
  last_played_at: number
  playtime_ms: number
}

interface DetailsRow {
  id: string
  title: string
  platform_id: string
  added_at: number
  last_played_at: number | null
  playtime_ms: number
}

interface RecentlyAddedRow {
  id: string
  title: string
  platform_id: string
  added_at: number
}

interface PlayableRow {
  id: string
  platform_id: string
  file_path: string
  emulator_id: string | null
  core: string | null
}

const PLAYABLE_COLUMNS = 'id, platform_id, file_path, emulator_id, core'

const toPlayable = (row: PlayableRow): PlayableGameRecord => ({
  id: row.id,
  platformId: row.platform_id,
  filePath: row.file_path,
  // Its emulator deleted, the core is forgotten with it.
  chosenCore:
    row.emulator_id !== null && row.core !== null
      ? { emulatorId: row.emulator_id, coreId: row.core }
      : null
})

/** The platforms the user turned off, whose games are left out of Home. */
const DISABLED_PLATFORMS = 'SELECT platform_id FROM platform_settings WHERE is_enabled = 0'

/** The SQL of playing the library's games, over `db`. */
export function createGamesRepository(db: DatabaseSync): GamesRepository {
  return {
    findPlayable(id) {
      const row = db
        .prepare(`SELECT ${PLAYABLE_COLUMNS} FROM games WHERE id = ? AND folder_id IS NOT NULL`)
        .get(id) as PlayableRow | undefined
      return row && toPlayable(row)
    },

    listPlayable() {
      const rows = db
        .prepare(`SELECT ${PLAYABLE_COLUMNS} FROM games WHERE folder_id IS NOT NULL ORDER BY id`)
        .all() as unknown as PlayableRow[]
      return rows.map(toPlayable)
    },

    setChosenCore(id, core) {
      db.prepare('UPDATE games SET emulator_id = ?, core = ? WHERE id = ?').run(
        core?.emulatorId ?? null,
        core?.coreId ?? null,
        id
      )
    },

    findLastPlayer(gameId) {
      const row = db
        .prepare(
          `SELECT emulator_id, core FROM play_sessions
            WHERE game_id = ? AND emulator_id IS NOT NULL
            ORDER BY ended_at DESC, created_at DESC
            LIMIT 1`
        )
        .get(gameId) as { emulator_id: string; core: string | null } | undefined
      return row && { emulatorId: row.emulator_id, core: row.core }
    },

    findLastPlayed() {
      const row = db
        .prepare(
          `SELECT games.id, games.title, games.platform_id,
              MAX(play_sessions.ended_at) AS last_played_at,
              SUM(play_sessions.ended_at - play_sessions.started_at) AS playtime_ms
            FROM play_sessions
            JOIN games ON games.id = play_sessions.game_id
            WHERE games.folder_id IS NOT NULL AND games.platform_id NOT IN (${DISABLED_PLATFORMS})
            GROUP BY games.id
            ORDER BY last_played_at DESC
            LIMIT 1`
        )
        .get() as LastPlayedRow | undefined
      if (!row) return null
      return {
        id: row.id,
        title: row.title,
        platformId: row.platform_id,
        lastPlayedAt: row.last_played_at,
        playtimeMs: row.playtime_ms
      }
    },

    listRecentlyAdded(limit) {
      const rows = db
        .prepare(
          `SELECT id, title, platform_id, added_at FROM games
            WHERE folder_id IS NOT NULL AND platform_id NOT IN (${DISABLED_PLATFORMS})
            ORDER BY added_at DESC, title COLLATE NOCASE, file_path
            LIMIT ?`
        )
        .all(limit) as unknown as RecentlyAddedRow[]
      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        platformId: row.platform_id,
        addedAt: row.added_at
      }))
    },

    findDetails(id) {
      const row = db
        .prepare(
          `SELECT games.id, games.title, games.platform_id, games.added_at,
              MAX(play_sessions.ended_at) AS last_played_at,
              COALESCE(SUM(play_sessions.ended_at - play_sessions.started_at), 0) AS playtime_ms
            FROM games
            LEFT JOIN play_sessions ON play_sessions.game_id = games.id
            WHERE games.id = ? AND games.folder_id IS NOT NULL
            GROUP BY games.id`
        )
        .get(id) as DetailsRow | undefined
      if (!row) return null
      return {
        id: row.id,
        title: row.title,
        platformId: row.platform_id,
        addedAt: row.added_at,
        lastPlayedAt: row.last_played_at,
        playtimeMs: row.playtime_ms
      }
    },

    addPlaySession(session) {
      db.prepare(
        `INSERT INTO play_sessions
            (id, game_id, emulator_id, core, started_at, ended_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        session.id,
        session.gameId,
        session.emulatorId,
        session.core,
        session.startedAt,
        session.endedAt,
        session.createdAt
      )
    }
  }
}
