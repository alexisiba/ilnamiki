/** A source of game metadata Ilnamiki knows. */
export type MetadataProviderId = 'libretro-database' | 'libretro-thumbnails'

/** A game of the library to identify. */
export interface GameToIdentify {
  /** Platform it belongs to, e.g. "nintendo_64". */
  platformId: string
  /** Absolute path of its file. */
  filePath: string
}

/** How a game was recognized: by its file's checksum, its disc's serial, or its file's exact name. */
export type IdentifiedBy = 'crc' | 'serial' | 'file-name'

/** Which game a file is, in a provider's database. Content providers look games up by it. */
export interface GameIdentity {
  /** The provider that identified it. */
  providerId: MetadataProviderId
  /** Database the game is in, e.g. "Nintendo - Game Boy". */
  database: string
  /** Its name in that database, e.g. "Metal Gear Solid (USA)". */
  name: string
  identifiedBy: IdentifiedBy
}

/** What is known about a game; null for each field nobody knows. */
export interface GameDetails {
  /** Readable title, e.g. "The Legend of Zelda - Link's Awakening". */
  title: string | null
  releaseYear: number | null
  /** 1 to 12. */
  releaseMonth: number | null
  developer: string | null
  publisher: string | null
  genre: string | null
  /** Most players at once. */
  players: number | null
}

/** The images of a game Ilnamiki shows, one of each at most. */
export type ArtworkKind = 'cover' | 'title-screen' | 'screenshot'

/** Every artwork kind, in the order they are looked for. */
export const ARTWORK_KINDS: ArtworkKind[] = ['cover', 'title-screen', 'screenshot']

/** Where a provider says an image of a game may be; it may turn out to be missing. */
export interface ArtworkUrl {
  kind: ArtworkKind
  url: string
}

/**
 * Thrown by a provider that couldn't look (no database for the platform yet, no network), so
 * the game isn't taken as asked and is tried again on a later run.
 */
export class MetadataUnavailableError extends Error {
  override name = 'MetadataUnavailableError'
}

/** Stage 1: tells which game a file is. */
export interface Identifier {
  id: MetadataProviderId
  /**
   * The game's identity, or null when this provider doesn't know the file. Throws only when it
   * couldn't look.
   */
  identify(game: GameToIdentify): Promise<GameIdentity | null>
}

/** Stage 2: gives content for an identity, only of the kinds it implements. */
export interface ContentProvider {
  id: MetadataProviderId
  /**
   * What it knows about the game, null for what it doesn't; null when it doesn't know the game.
   * Throws only when it couldn't look.
   */
  details?(identity: GameIdentity): Promise<GameDetails | null>
  /**
   * Where its images of the game may be, at most one per kind; none when it doesn't know the
   * game. An image it names may still be missing when downloaded: that kind is then asked of
   * the next provider. Throws only when it couldn't look.
   */
  artwork?(identity: GameIdentity): Promise<ArtworkUrl[]>
}
