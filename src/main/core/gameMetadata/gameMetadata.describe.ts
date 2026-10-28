import { findDetails, identifyGame, NO_DETAILS } from './gameMetadata.fallback'
import type { MetadataProviders } from './gameMetadata.providers'
import type { GameDetails, GameIdentity } from './gameMetadata.types'

/** What tells whether a file changed: its size and when it was last modified. */
export interface FileState {
  size: number
  /** Epoch ms, whole. */
  modifiedAt: number
}

/** A game of the library to describe, with its file as it was when it was last looked at. */
export interface GameToDescribe {
  id: string
  platformId: string
  filePath: string
  /** Null when its providers were never all asked. */
  lookedAtFile: FileState | null
}

/** What every provider said about a game, once all were asked. */
export interface DescribedGame {
  gameId: string
  /** Null when no identifier knew it. */
  identity: GameIdentity | null
  details: GameDetails
  /** Its file when it was looked at, to tell later whether it changed. */
  file: FileState
}

const isSameFile = (a: FileState, b: FileState): boolean =>
  a.size === b.size && a.modifiedAt === b.modifiedAt

/**
 * Asks `providers` about `game`: which game it is, then its details. Null when there is
 * nothing to do: its file is gone (`fileStateOf` gives null) or is as it was when it was last
 * looked at, since a game is asked once. Throws when a provider couldn't look, so the game
 * isn't taken as asked.
 */
export async function describeGame(
  game: GameToDescribe,
  providers: MetadataProviders,
  fileStateOf: (path: string) => Promise<FileState | null>
): Promise<DescribedGame | null> {
  const file = await fileStateOf(game.filePath)
  if (!file) return null
  if (game.lookedAtFile && isSameFile(game.lookedAtFile, file)) return null

  const identity = await identifyGame(providers.identifiers, game)
  const details = identity ? await findDetails(providers.details, identity) : NO_DETAILS
  return { gameId: game.id, identity, details, file }
}
