import type { DatabaseSync } from 'node:sqlite'

/** A game in a folder, with what it takes to play it. */
export interface PlayableGameRecord {
  id: string
  platformId: string
  /** Absolute path of the file the emulator opens. */
  filePath: string
}

export interface GamesRepository {
  /** The game `id` while it is in a folder; removed games can't be played. */
  findPlayable(id: string): PlayableGameRecord | undefined
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
    }
  }
}
