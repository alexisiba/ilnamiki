import type { DatabaseSync } from 'node:sqlite'

import type {
  EmulatorChoice,
  GameDetails,
  LastPlayedGame,
  RecentlyAddedGame,
  RecentlyPlayedGame
} from '@shared/api'

import { JOIN_GAME_METADATA, SHOWN_TITLE } from '../../core/gameMetadata'

/** A game in a folder, with what it takes to play it. */
export interface PlayableGameRecord {
  id: string
  platformId: string
  /** Absolute path of the file the emulator opens. */
  filePath: string
  /** The emulator the user chose for it; null while they chose none or it is gone. */
  chosenEmulator: EmulatorChoice | null
}

/** A time a game was played, from when its emulator started until it closed. */
export interface PlaySessionRecord {
  id: string
  gameId: string
  /** The emulator, and its option, it was played with. */
  emulator: EmulatorChoice
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
  /** Every game in a folder, of every platform; removed games can't be played. */
  listPlayable(): PlayableGameRecord[]
  /** Keeps the emulator the game `id` plays with, or forgets it with null. */
  setChosenEmulator(id: string, emulator: EmulatorChoice | null): void
  /**
   * The emulator, and its option, the game `gameId` was last played with, or undefined when
   * it was never played with an emulator the user still has.
   */
  findLastPlayer(gameId: string): EmulatorChoice | undefined
  /**
   * The game in a folder played most recently, or null when none was played; games of a
   * platform turned off are left out.
   */
  findLastPlayed(): LastPlayedGame | null
  /**
   * The `limit` games played most recently after the one `findLastPlayed` finds, newest first,
   * left out as it leaves them out.
   */
  listRecentlyPlayed(limit: number): RecentlyPlayedGame[]
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
  emulator_option: string | null
}

const PLAYABLE_COLUMNS = 'id, platform_id, file_path, emulator_id, emulator_option'

const toPlayable = (row: PlayableRow): PlayableGameRecord => ({
  id: row.id,
  platformId: row.platform_id,
  filePath: row.file_path,
  // Its emulator deleted, the option is forgotten with it.
  chosenEmulator:
    row.emulator_id !== null ? { emulatorId: row.emulator_id, optionId: row.emulator_option } : null
})

/** The platforms the user turned off, whose games are left out of Home. */
const DISABLED_PLATFORMS = 'SELECT platform_id FROM platform_settings WHERE is_enabled = 0'

/**
 * The games in a folder that were played, of platforms that are on, with when each was last
 * played and its total playtime, last played first. The last played game and the ones played
 * before it read it in the same order, so neither shows a game the other does.
 */
const PLAYED_GAMES = `SELECT games.id, ${SHOWN_TITLE} AS title, games.platform_id,
    MAX(play_sessions.ended_at) AS last_played_at,
    SUM(play_sessions.ended_at - play_sessions.started_at) AS playtime_ms
  FROM play_sessions
  JOIN games ON games.id = play_sessions.game_id
  ${JOIN_GAME_METADATA}
  WHERE games.folder_id IS NOT NULL AND games.platform_id NOT IN (${DISABLED_PLATFORMS})
  GROUP BY games.id
  ORDER BY last_played_at DESC, games.id`

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

    setChosenEmulator(id, emulator) {
      db.prepare('UPDATE games SET emulator_id = ?, emulator_option = ? WHERE id = ?').run(
        emulator?.emulatorId ?? null,
        emulator?.optionId ?? null,
        id
      )
    },

    findLastPlayer(gameId) {
      const row = db
        .prepare(
          `SELECT emulator_id, emulator_option FROM play_sessions
            WHERE game_id = ? AND emulator_id IS NOT NULL
            ORDER BY ended_at DESC, created_at DESC
            LIMIT 1`
        )
        .get(gameId) as { emulator_id: string; emulator_option: string | null } | undefined
      return row && { emulatorId: row.emulator_id, optionId: row.emulator_option }
    },

    findLastPlayed() {
      const row = db.prepare(`${PLAYED_GAMES} LIMIT 1`).get() as LastPlayedRow | undefined
      if (!row) return null
      return {
        id: row.id,
        title: row.title,
        platformId: row.platform_id,
        lastPlayedAt: row.last_played_at,
        playtimeMs: row.playtime_ms
      }
    },

    listRecentlyPlayed(limit) {
      const rows = db
        .prepare(`${PLAYED_GAMES} LIMIT ? OFFSET 1`)
        .all(limit) as unknown as LastPlayedRow[]
      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        platformId: row.platform_id,
        lastPlayedAt: row.last_played_at
      }))
    },

    listRecentlyAdded(limit) {
      const rows = db
        .prepare(
          `SELECT games.id, ${SHOWN_TITLE} AS title, games.platform_id, games.added_at
            FROM games
            ${JOIN_GAME_METADATA}
            WHERE games.folder_id IS NOT NULL
              AND games.platform_id NOT IN (${DISABLED_PLATFORMS})
            ORDER BY games.added_at DESC, title COLLATE NOCASE, games.file_path
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
          `SELECT games.id, ${SHOWN_TITLE} AS title, games.platform_id, games.added_at,
              MAX(play_sessions.ended_at) AS last_played_at,
              COALESCE(SUM(play_sessions.ended_at - play_sessions.started_at), 0) AS playtime_ms
            FROM games
            ${JOIN_GAME_METADATA}
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
            (id, game_id, emulator_id, emulator_option, started_at, ended_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        session.id,
        session.gameId,
        session.emulator.emulatorId,
        session.emulator.optionId,
        session.startedAt,
        session.endedAt,
        session.createdAt
      )
    }
  }
}
