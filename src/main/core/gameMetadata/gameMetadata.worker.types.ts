import type { DescribedGame, GameToDescribe } from './gameMetadata.describe'
import type { ProviderSources } from './gameMetadata.providers'

/** What main hands the metadata worker for one run. */
export interface MetadataWorkerInput {
  games: GameToDescribe[]
  sources: ProviderSources
}

/** What the metadata worker posts back: one game described, as soon as it is. */
export type MetadataWorkerMessage = DescribedGame
