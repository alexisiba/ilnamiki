import type { Game } from '@renderer/types/game'

/** Lowercase and without accents, so "zelda" finds "Zelda" and "pokemon" finds "Pokémon". */
const normalize = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/**
 * The first `limit` games whose title contains `query`, ignoring case, accents and the spaces
 * around it, in library order. An empty query finds nothing.
 */
export function searchGames(query: string, games: Game[], limit: number): Game[] {
  const needle = normalize(query.trim())
  if (!needle) return []

  return games.filter((game) => normalize(game.title).includes(needle)).slice(0, limit)
}
