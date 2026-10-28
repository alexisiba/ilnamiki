import {
  ARTWORK_KINDS,
  type ArtworkKind,
  type ArtworkUrl,
  type ContentProvider,
  type GameDetails,
  type GameIdentity,
  type GameToIdentify,
  type Identifier
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

/** One artwork kind of a game, once every provider that could have it was asked. */
export interface FoundArtwork {
  kind: ArtworkKind
  /** The image's file; null when no provider had it. */
  path: string | null
}

/**
 * The artwork of the game `identity`, one image per kind: for each kind, `providers` are asked
 * in order and `download` fetches the image the first names; when it turns out to be missing,
 * the next provider is asked for that kind. What none has stays null.
 */
export async function findArtwork(
  providers: ContentProvider[],
  identity: GameIdentity,
  download: (kind: ArtworkKind, url: string) => Promise<string | null>
): Promise<FoundArtwork[]> {
  // Each provider is asked once for all its images, only when a kind still needs it.
  const named = new Map<ContentProvider, Promise<ArtworkUrl[]>>()
  const urlsOf = (provider: ContentProvider): Promise<ArtworkUrl[]> => {
    let urls = named.get(provider)
    if (!urls) {
      urls = provider.artwork?.(identity) ?? Promise.resolve([])
      named.set(provider, urls)
    }
    return urls
  }

  // The kinds don't depend on each other, so their images download at the same time.
  return Promise.all(
    ARTWORK_KINDS.map(async (kind): Promise<FoundArtwork> => {
      for (const provider of providers) {
        const url = (await urlsOf(provider)).find((image) => image.kind === kind)?.url
        const path = url ? await download(kind, url) : null
        if (path) return { kind, path }
      }
      return { kind, path: null }
    })
  )
}
