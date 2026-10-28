import type { DatabaseSync } from 'node:sqlite'

import type { GameArtwork } from '@shared/api'

import {
  ARTWORK_COLUMNS,
  type ArtworkColumns,
  JOIN_GAME_METADATA,
  SHOWN_TITLE,
  toGameArtwork
} from '../../core/gameMetadata'

/** A game folder as it is stored. */
export interface FolderRecord {
  id: string
  path: string
  platformId: string
  createdAt: number
  updatedAt: number
}

/** A folder with the number of its games that aren't removed. */
export interface FolderWithGameCount extends FolderRecord {
  gameCount: number
}

/** A game to keep from a folder. */
export interface GameToSave {
  /** Used only when the game is new; a game stored before keeps its id. */
  id: string
  /** Absolute path of the file the emulator opens. */
  filePath: string
  title: string
}

/** A game in a folder, as it is stored. */
export interface GameRecord {
  id: string
  filePath: string
  /** The title shown: its metadata's when it has one, else its file's name. */
  title: string
  artwork: GameArtwork
}

interface GameRow extends ArtworkColumns {
  id: string
  file_path: string
  title: string
}

interface FolderRow {
  id: string
  path: string
  platform_id: string
  created_at: number
  updated_at: number
  game_count: number
}

const toFolder = (row: FolderRow): FolderWithGameCount => ({
  id: row.id,
  path: row.path,
  platformId: row.platform_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  gameCount: row.game_count
})

const SELECT_FOLDERS = `
  SELECT f.id, f.path, f.platform_id, f.created_at, f.updated_at,
    (SELECT count(*) FROM games g WHERE g.folder_id = f.id) AS game_count
  FROM library_folders f`

export interface LibraryRepository {
  insertFolder(record: FolderRecord): void
  /**
   * Keeps `games` in the folder `folderId` of `platformId`, found at `now`. A game stored
   * before with the same platform and file (e.g. removed with its folder) is kept with its id
   * and history, back in this folder with its title updated.
   */
  saveGames(folderId: string, platformId: string, games: GameToSave[], now: number): void
  /** The games in the folder `folderId` (not the removed ones), by title. */
  listGames(folderId: string): GameRecord[]
  /** Marks the games `ids` removed at `now`, out of their folder, keeping their history. */
  removeGames(ids: string[], now: number): void
  /** Records that the folder `id` changed at `now`. */
  touchFolder(id: string, now: number): void
  /** Deletes the folder `id`; its games must be marked removed first. */
  deleteFolder(id: string): void
  /** Points the folder `id` at `path`. */
  setFolderPath(id: string, path: string): void
  /**
   * Points the game `id` at `filePath`, unless another game of its platform is stored with
   * that file (e.g. one removed before), which then is the one kept when it is found again.
   */
  setGameFilePath(id: string, filePath: string): void
  findFolderById(id: string): FolderWithGameCount | undefined
  findFolderByPath(path: string): FolderWithGameCount | undefined
  findFolderByPlatform(platformId: string): FolderWithGameCount | undefined
  /** Every folder, oldest first. */
  listFolders(): FolderWithGameCount[]
}

/** The SQL of the user's game folders and their games, over `db`. */
export function createLibraryRepository(db: DatabaseSync): LibraryRepository {
  const findFolder = (where: string, value: string): FolderWithGameCount | undefined => {
    const row = db.prepare(`${SELECT_FOLDERS} WHERE ${where} = ?`).get(value) as
      FolderRow | undefined
    return row && toFolder(row)
  }

  return {
    insertFolder(record) {
      db.prepare(
        `INSERT INTO library_folders (id, path, platform_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)`
      ).run(record.id, record.path, record.platformId, record.createdAt, record.updatedAt)
    },

    saveGames(folderId, platformId, games, now) {
      const save = db.prepare(
        `INSERT INTO games (id, folder_id, platform_id, file_path, title, added_at, removed_at)
          VALUES (?, ?, ?, ?, ?, ?, NULL)
          ON CONFLICT (platform_id, file_path) DO UPDATE SET
            folder_id = excluded.folder_id, title = excluded.title, removed_at = NULL`
      )
      for (const game of games) {
        save.run(game.id, folderId, platformId, game.filePath, game.title, now)
      }
    },

    listGames(folderId) {
      const rows = db
        .prepare(
          `SELECT games.id, games.file_path, ${SHOWN_TITLE} AS title, ${ARTWORK_COLUMNS}
            FROM games
            ${JOIN_GAME_METADATA}
            WHERE games.folder_id = ?
            ORDER BY title COLLATE NOCASE, games.file_path`
        )
        .all(folderId) as unknown as GameRow[]
      return rows.map((row) => ({
        id: row.id,
        filePath: row.file_path,
        title: row.title,
        artwork: toGameArtwork(row.id, row)
      }))
    },

    removeGames(ids, now) {
      const remove = db.prepare(
        'UPDATE games SET folder_id = NULL, removed_at = ? WHERE id = ? AND folder_id IS NOT NULL'
      )
      for (const id of ids) remove.run(now, id)
    },

    touchFolder(id, now) {
      db.prepare('UPDATE library_folders SET updated_at = ? WHERE id = ?').run(now, id)
    },

    deleteFolder(id) {
      db.prepare('DELETE FROM library_folders WHERE id = ?').run(id)
    },

    setFolderPath(id, path) {
      db.prepare('UPDATE library_folders SET path = ? WHERE id = ?').run(path, id)
    },

    setGameFilePath(id, filePath) {
      db.prepare('UPDATE OR IGNORE games SET file_path = ? WHERE id = ?').run(filePath, id)
    },

    findFolderById: (id) => findFolder('f.id', id),
    findFolderByPath: (path) => findFolder('f.path', path),
    findFolderByPlatform: (platformId) => findFolder('f.platform_id', platformId),

    listFolders() {
      const rows = db
        .prepare(`${SELECT_FOLDERS} ORDER BY f.created_at, f.id`)
        .all() as unknown as FolderRow[]
      return rows.map(toFolder)
    }
  }
}
