/** Game ids are UUIDs. */
const GAME_ID_PATTERN = /^[0-9a-f-]{36}$/

/** `value` as a game id, or null when it can't be one. */
export function parseGameId(value: unknown): string | null {
  return typeof value === 'string' && GAME_ID_PATTERN.test(value) ? value : null
}
