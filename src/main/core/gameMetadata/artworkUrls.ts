import type { GameArtwork } from '@shared/api'

import { ARTWORK_KINDS, type ArtworkKind } from './gameMetadata.types'

/** The scheme the renderer loads games' images with, served by main from their files. */
export const ARTWORK_SCHEME = 'ilnamiki-artwork'

/** Game ids are UUIDs. */
const GAME_ID_PATTERN = /^[0-9a-f-]{36}$/

/**
 * The URL of a game's image of `kind`, e.g. "ilnamiki-artwork://game/<id>/cover?v=1700000000000".
 * `version` (when it was found) changes when the image is downloaded again, so the renderer
 * never shows an old copy it kept.
 */
export const artworkUrl = (gameId: string, kind: ArtworkKind, version: number): string =>
  `${ARTWORK_SCHEME}://game/${gameId}/${kind}?v=${version}`

/** The game and the kind of image `url` asks for; null for any other URL. */
export function parseArtworkUrl(url: string): { gameId: string; kind: ArtworkKind } | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  if (parsed.protocol !== `${ARTWORK_SCHEME}:` || parsed.hostname !== 'game') return null
  const [, gameId, kind, ...rest] = parsed.pathname.split('/')
  if (rest.length > 0 || !GAME_ID_PATTERN.test(gameId ?? '')) return null
  const artworkKind = ARTWORK_KINDS.find((known) => known === kind)
  return artworkKind ? { gameId, kind: artworkKind } : null
}

/**
 * Columns of a query over `games` that say which images each game has: when each kind was
 * found, null when it has no file. `toGameArtwork` turns them into the contract's URLs.
 */
export const ARTWORK_COLUMNS = `
  (SELECT looked_at FROM game_images
    WHERE game_images.game_id = games.id AND kind = 'cover' AND path IS NOT NULL)
    AS cover_version,
  (SELECT looked_at FROM game_images
    WHERE game_images.game_id = games.id AND kind = 'title_screen' AND path IS NOT NULL)
    AS title_screen_version,
  (SELECT looked_at FROM game_images
    WHERE game_images.game_id = games.id AND kind = 'screenshot' AND path IS NOT NULL)
    AS screenshot_version`

/** What `ARTWORK_COLUMNS` reads for a game. */
export interface ArtworkColumns {
  cover_version: number | null
  title_screen_version: number | null
  screenshot_version: number | null
}

/** The images of the game `gameId` as the renderer shows them, from `ARTWORK_COLUMNS`. */
export function toGameArtwork(gameId: string, row: ArtworkColumns): GameArtwork {
  const url = (kind: ArtworkKind, version: number | null): string | null =>
    version === null ? null : artworkUrl(gameId, kind, version)
  return {
    cover: url('cover', row.cover_version),
    titleScreen: url('title-screen', row.title_screen_version),
    screenshot: url('screenshot', row.screenshot_version)
  }
}
