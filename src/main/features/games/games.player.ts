import type { EmulatorChoice, GameEmulatorReason, PlatformEmulator } from '@shared/api'

import { isAmongEmulators } from '../../core/installedPlatforms'

/** The emulators that could play a game, one for each reason it might play with them. */
export interface EmulatorCandidates {
  /** The emulator the user chose for the game. */
  game: EmulatorChoice | null
  /** The emulator the game was last played with. */
  lastSession: EmulatorChoice | null
  /** The emulator the user chose for the game's platform. */
  platformDefault: EmulatorChoice | null
  /** The emulators that play the game's platform, by name. */
  installed: PlatformEmulator[]
}

/**
 * The emulator a game plays with, and why: the first of the game's, its last session's and
 * its platform's that still plays the platform, or else the platform's first emulator. Null
 * when no emulator plays the platform.
 */
export function choosePlayingEmulator({
  game,
  lastSession,
  platformDefault,
  installed
}: EmulatorCandidates): { emulator: EmulatorChoice; reason: GameEmulatorReason } | null {
  const candidates: [GameEmulatorReason, EmulatorChoice | null][] = [
    ['game', game],
    ['last-session', lastSession],
    ['platform-default', platformDefault]
  ]
  for (const [reason, emulator] of candidates) {
    if (emulator && isAmongEmulators(emulator, installed)) return { emulator, reason }
  }

  const first = installed[0]
  if (!first) return null
  return {
    emulator: { emulatorId: first.emulatorId, optionId: first.optionId },
    reason: 'first-installed'
  }
}
