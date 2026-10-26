/**
 * Shortest time a game must be open to count as played: shorter, the emulator most likely
 * closed on its own (e.g. the core couldn't open the game) or the user left right away.
 */
export const MIN_PLAY_SESSION_MS = 10_000

/** Whether a game open from `startedAt` to `endedAt` (epoch ms) counts as played. */
export function isPlaySession(startedAt: number, endedAt: number): boolean {
  return endedAt - startedAt >= MIN_PLAY_SESSION_MS
}
