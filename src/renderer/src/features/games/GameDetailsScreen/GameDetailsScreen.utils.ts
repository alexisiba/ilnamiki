import type { GameDetails } from '@shared/api'

/**
 * The facts of a game's metadata the details screen lists, in order: the year it came out, its
 * genre, its developer and how many play at once (worded by `playersText`), leaving out what is
 * unknown. Empty when nothing is known. The genre and the developer are shown as the metadata
 * has them, never translated.
 */
export function gameFacts(game: GameDetails, playersText: (count: number) => string): string[] {
  return [
    game.releaseYear?.toString() ?? null,
    game.genre,
    game.developer,
    game.players === null ? null : playersText(game.players)
  ].filter((fact) => fact !== null)
}
