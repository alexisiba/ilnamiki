import type { CoreRef, GameCoreReason, InstalledCore } from '@shared/api'

const REASON_KEYS: Record<GameCoreReason, string> = {
  game: 'gameOptions.reasons.game',
  'last-session': 'gameOptions.reasons.lastSession',
  'platform-default': 'gameOptions.reasons.platformDefault',
  'first-installed': 'gameOptions.reasons.firstInstalled'
}

/** The key, in the `common` namespace, of why a game plays with its core. */
export function coreReasonKey(reason: GameCoreReason): string {
  return REASON_KEYS[reason]
}

/** Whether `core` names the installed core `installed`. */
export function isSameCore(core: CoreRef, installed: InstalledCore): boolean {
  return core.coreId === installed.id && core.emulatorId === installed.emulatorId
}

/** The name of `core` among `cores`, or its id when it isn't one of them. */
export function getCoreName(core: CoreRef, cores: InstalledCore[]): string {
  return cores.find((installed) => isSameCore(core, installed))?.name ?? core.coreId
}
