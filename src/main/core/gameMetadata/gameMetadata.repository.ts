import type { DatabaseSync } from 'node:sqlite'

import type { DescribedGame, GameToDescribe, MetadataUpdate } from './gameMetadata.describe'
import type { FoundArtwork } from './gameMetadata.fallback'
import {
  ARTWORK_KINDS,
  type ArtworkKind,
  type IdentifiedBy,
  type MetadataProviderId
} from './gameMetadata.types'

/** Joins each game's metadata, if any, so queries can use `SHOWN_TITLE`. */
export const JOIN_GAME_METADATA = 'LEFT JOIN game_metadata ON game_metadata.game_id = games.id'

/** The title shown for a game: its metadata's when it has one, else its file's name. */
export const SHOWN_TITLE = 'COALESCE(game_metadata.title, games.title)'

/** How each artwork kind is written in the database. */
const STORED_KINDS: Record<ArtworkKind, string> = {
  cover: 'cover',
  'title-screen': 'title_screen',
  screenshot: 'screenshot'
}

export interface GameMetadataRepository {
  /**
   * The games in the folders `folderIds` (every folder when null), not the removed ones, with
   * what was found about them last time; oldest first.
   */
  listGamesToDescribe(folderIds: string[] | null): GameToDescribe[]
  /**
   * Keeps what was found, in order, looked at `now` (epoch ms), replacing the old. A game's
   * details found again forget its artwork, which is found again for its new identity.
   */
  save(updates: MetadataUpdate[], now: number): void
}

interface GameToDescribeRow {
  id: string
  platform_id: string
  file_path: string
  file_size: number | null
  file_modified_at: number | null
  identity_provider: MetadataProviderId | null
  identity_database: string | null
  identity_name: string | null
  identified_by: IdentifiedBy | null
  artwork_count: number
}

/** The SQL of what was found about each game, over `db`. */
export function createGameMetadataRepository(db: DatabaseSync): GameMetadataRepository {
  const saveDetails = (game: DescribedGame, now: number): void => {
    const { gameId, identity, details, file } = game
    db.prepare(
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
    ).run(
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
    db.prepare('DELETE FROM game_images WHERE game_id = ?').run(gameId)
  }

  const saveArtwork = (gameId: string, artwork: FoundArtwork[], now: number): void => {
    const save = db.prepare(
      `INSERT INTO game_images (game_id, kind, path, looked_at) VALUES (?, ?, ?, ?)
        ON CONFLICT (game_id, kind) DO UPDATE SET
          path = excluded.path, looked_at = excluded.looked_at`
    )
    for (const { kind, path } of artwork) save.run(gameId, STORED_KINDS[kind], path, now)
  }

  return {
    listGamesToDescribe(folderIds) {
      if (folderIds?.length === 0) return []
      const inFolders = folderIds
        ? `AND games.folder_id IN (${folderIds.map(() => '?').join(', ')})`
        : ''
      const rows = db
        .prepare(
          `SELECT games.id, games.platform_id, games.file_path,
              game_metadata.file_size, game_metadata.file_modified_at,
              game_metadata.identity_provider, game_metadata.identity_database,
              game_metadata.identity_name, game_metadata.identified_by,
              (SELECT count(*) FROM game_images WHERE game_images.game_id = games.id)
                AS artwork_count
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
            : null,
        identity:
          row.identity_provider !== null &&
          row.identity_database !== null &&
          row.identity_name !== null &&
          row.identified_by !== null
            ? {
                providerId: row.identity_provider,
                database: row.identity_database,
                name: row.identity_name,
                identifiedBy: row.identified_by
              }
            : null,
        isArtworkAsked: row.artwork_count >= ARTWORK_KINDS.length
      }))
    },

    save(updates, now) {
      for (const update of updates) {
        if (update.type === 'details') saveDetails(update.game, now)
        else saveArtwork(update.gameId, update.artwork, now)
      }
    }
  }
}
