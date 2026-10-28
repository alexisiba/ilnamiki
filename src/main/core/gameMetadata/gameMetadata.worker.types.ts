import type { GameToDescribe, MetadataUpdate } from './gameMetadata.describe'
import type { ProviderSources } from './gameMetadata.providers'

/** What main hands the metadata worker for one run. */
export interface MetadataWorkerInput {
  games: GameToDescribe[]
  sources: ProviderSources
  /** Where artwork is kept, one folder per game. */
  artworkFolder: string
  /** Sent with every download, e.g. "Ilnamiki/1.0.0". */
  userAgent: string
}

/** What the metadata worker posts back: what it found about one game, as soon as it does. */
export type MetadataWorkerMessage = MetadataUpdate
