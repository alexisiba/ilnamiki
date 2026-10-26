import type { DatabaseSync } from 'node:sqlite'

import type { LastPlayedGame } from '@shared/api'

/** A game in a folder, with what it takes to play it. */
export interface PlayableGameRecord {
  id: string
  platformId: string
  /** Absolute path of the file the emulator opens. */
  filePath: string
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

export interface GamesRepository {
  /** The game `id` while it is in a folder; removed games can't be played. */
  findPlayable(id: string): PlayableGameRecord | undefined
  /** The game in a folder played most recently, or null when none was played. */
  findLastPlayed(): LastPlayedGame | null
  addPlaySession(session: PlaySessionRecord): void
}

interface LastPlayedRow {
  id: string
  title: string
  platform_id: string
  last_played_at: number
  playtime_ms: number
}

/** The SQL of playing the library's games, over `db`. */
export function createGamesRepository(db: DatabaseSync): GamesRepository {
  return {
    findPlayable(id) {
      const row = db
        .prepare(
          'SELECT id, platform_id, file_path FROM games WHERE id = ? AND folder_id IS NOT NULL'
        )
        .get(id) as { id: string; platform_id: string; file_path: string } | undefined
      return row && { id: row.id, platformId: row.platform_id, filePath: row.file_path }
    },

    findLastPlayed() {
      const row = db
        .prepare(
          `SELECT games.id, games.title, games.platform_id,
              MAX(play_sessions.ended_at) AS last_played_at,
              SUM(play_sessions.ended_at - play_sessions.started_at) AS playtime_ms
            FROM play_sessions
            JOIN games ON games.id = play_sessions.game_id
            WHERE games.folder_id IS NOT NULL
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
