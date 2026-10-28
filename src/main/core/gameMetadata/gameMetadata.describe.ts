import { type FoundArtwork, findDetails, identifyGame, NO_DETAILS } from './gameMetadata.fallback'
import type { MetadataProviders } from './gameMetadata.providers'
import type { GameDetails, GameIdentity } from './gameMetadata.types'

/** What tells whether a file changed: its size and when it was last modified. */
export interface FileState {
  size: number
  /** Epoch ms, whole. */
  modifiedAt: number
}

/** A game of the library to describe, with what was found about it last time. */
export interface GameToDescribe {
  id: string
  platformId: string
  filePath: string
  /** Its file when it was last looked at; null when its providers were never all asked. */
  lookedAtFile: FileState | null
  /** The identity found last time; null when unidentified or never looked at. */
  identity: GameIdentity | null
  /** Whether every artwork kind was asked for its identity. */
  isArtworkAsked: boolean
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

/** What a run found about one game, written as it comes. */
export type MetadataUpdate =
  | { type: 'details'; game: DescribedGame }
  | { type: 'artwork'; gameId: string; artwork: FoundArtwork[] }

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

/**
 * The identity whose artwork `game` still needs: the new one when it was just `described`
 * (its artwork is found again with it), else the one found before while its artwork was never
 * all asked. Null when there is none to look for: an unidentified game has no artwork.
 */
export function artworkIdentityOf(
  game: GameToDescribe,
  described: DescribedGame | null
): GameIdentity | null {
  if (described) return described.identity
  return game.isArtworkAsked ? null : game.identity
}
