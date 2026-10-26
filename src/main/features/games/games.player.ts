import type { CoreRef, GameCoreReason, InstalledCore } from '@shared/api'

import { isAmongCores } from '../../core/installedPlatforms'

/** The cores that could play a game, one for each reason it might play with them. */
export interface CoreCandidates {
  /** The core the user chose for the game. */
  game: CoreRef | null
  /** The core the game was last played with. */
  lastSession: CoreRef | null
  /** The core the user chose for the game's platform. */
  platformDefault: CoreRef | null
  /** The installed cores that play the game's platform, by name. */
  installed: InstalledCore[]
}

/**
 * The core a game plays with, and why: the first of the game's, its last session's and its
 * platform's that is still installed, or else the platform's first installed core. Null when
 * no installed core plays the platform.
 */
export function choosePlayingCore({
  game,
  lastSession,
  platformDefault,
  installed
}: CoreCandidates): { core: CoreRef; reason: GameCoreReason } | null {
  const candidates: [GameCoreReason, CoreRef | null][] = [
    ['game', game],
    ['last-session', lastSession],
    ['platform-default', platformDefault]
  ]
  for (const [reason, core] of candidates) {
    if (core && isAmongCores(core, installed)) return { core, reason }
  }

  const first = installed[0]
  if (!first) return null
  return { core: { emulatorId: first.emulatorId, coreId: first.id }, reason: 'first-installed' }
}
