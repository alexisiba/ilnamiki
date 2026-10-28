import type {
  ContentProvider,
  GameDetails,
  GameIdentity,
  GameToIdentify,
  Identifier
} from './gameMetadata.types'

/** Details nobody knows yet. */
export const NO_DETAILS: GameDetails = {
  title: null,
  releaseYear: null,
  releaseMonth: null,
  developer: null,
  publisher: null,
  genre: null,
  players: null
}

const DETAIL_FIELDS = Object.keys(NO_DETAILS) as (keyof GameDetails)[]

/** Whether every field of `details` is known. */
const isComplete = (details: GameDetails): boolean =>
  DETAIL_FIELDS.every((field) => details[field] !== null)

/** `known` with the fields it doesn't know taken from `found`; a known field never changes. */
export function fillMissing(known: GameDetails, found: GameDetails): GameDetails {
  const entries = DETAIL_FIELDS.map((field) => [field, known[field] ?? found[field]])
  return Object.fromEntries(entries) as GameDetails
}

/** The identity the first of `identifiers` that knows `game` gives, or null when none does. */
export async function identifyGame(
  identifiers: Identifier[],
  game: GameToIdentify
): Promise<GameIdentity | null> {
  for (const identifier of identifiers) {
    const identity = await identifier.identify(game)
    if (identity) return identity
  }
  return null
}

/**
 * The details of the game `identity`, asking `providers` in order only for what is still
 * missing: each field comes from the first provider that knows it. What none knows stays null.
 */
export async function findDetails(
  providers: ContentProvider[],
  identity: GameIdentity
): Promise<GameDetails> {
  let details = NO_DETAILS
  for (const provider of providers) {
    if (isComplete(details)) break
    const found = await provider.details?.(identity)
    if (found) details = fillMissing(details, found)
  }
  return details
}
