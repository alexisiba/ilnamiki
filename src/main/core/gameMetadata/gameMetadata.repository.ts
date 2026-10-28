import type { DatabaseSync } from 'node:sqlite'

import type { DescribedGame, GameToDescribe } from './gameMetadata.describe'

/** Joins each game's metadata, if any, so queries can use `SHOWN_TITLE`. */
export const JOIN_GAME_METADATA = 'LEFT JOIN game_metadata ON game_metadata.game_id = games.id'

/** The title shown for a game: its metadata's when it has one, else its file's name. */
export const SHOWN_TITLE = 'COALESCE(game_metadata.title, games.title)'

export interface GameMetadataRepository {
  /**
   * The games in the folders `folderIds` (every folder when null), not the removed ones, with
   * their file as it was when last looked at; oldest first.
   */
  listGamesToDescribe(folderIds: string[] | null): GameToDescribe[]
  /** Keeps what was found about each of `games`, looked at `now` (epoch ms), replacing the old. */
  save(games: DescribedGame[], now: number): void
}

interface GameToDescribeRow {
  id: string
  platform_id: string
  file_path: string
  file_size: number | null
  file_modified_at: number | null
}

/** The SQL of what was found about each game, over `db`. */
export function createGameMetadataRepository(db: DatabaseSync): GameMetadataRepository {
  return {
    listGamesToDescribe(folderIds) {
      if (folderIds?.length === 0) return []
      const inFolders = folderIds
        ? `AND games.folder_id IN (${folderIds.map(() => '?').join(', ')})`
        : ''
      const rows = db
        .prepare(
          `SELECT games.id, games.platform_id, games.file_path,
              game_metadata.file_size, game_metadata.file_modified_at
            FROM games
            ${JOIN_GAME_METADATA}
            WHERE games.folder_id IS NOT NULL ${inFolders}
            ORDER BY games.added_at, games.id`
        )
        .all(...(folderIds ?? [])) as unknown as GameToDescribeRow[]
      return rows.map((row) => ({
        id: row.id,
        platformId: row.platform_id,
        filePath: row.file_path,
        lookedAtFile:
          row.file_size !== null && row.file_modified_at !== null
            ? { size: row.file_size, modifiedAt: row.file_modified_at }
            : null
      }))
    },

    save(games, now) {
      const save = db.prepare(
        `INSERT INTO game_metadata (game_id, identity_provider, identity_database, identity_name,
            identified_by, title, release_year, release_month, developer, publisher, genre,
            players, file_size, file_modified_at, looked_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT (game_id) DO UPDATE SET
            identity_provider = excluded.identity_provider,
            identity_database = excluded.identity_database,
            identity_name = excluded.identity_name,
            identified_by = excluded.identified_by,
            title = excluded.title,
            release_year = excluded.release_year,
            release_month = excluded.release_month,
            developer = excluded.developer,
            publisher = excluded.publisher,
            genre = excluded.genre,
            players = excluded.players,
            file_size = excluded.file_size,
            file_modified_at = excluded.file_modified_at,
            looked_at = excluded.looked_at`
      )
      for (const { gameId, identity, details, file } of games) {
        save.run(
          gameId,
          identity?.providerId ?? null,
          identity?.database ?? null,
          identity?.name ?? null,
          identity?.identifiedBy ?? null,
          details.title,
          details.releaseYear,
          details.releaseMonth,
          details.developer,
          details.publisher,
          details.genre,
          details.players,
          file.size,
          file.modifiedAt,
          now
        )
      }
    }
  }
}
