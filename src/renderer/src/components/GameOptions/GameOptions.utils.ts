import type { EmulatorChoice, GameEmulatorReason, PlatformEmulator } from '@shared/api'

import { getEmulatorName, isSameEmulator } from '@renderer/utils/emulatorName'

const REASON_KEYS: Record<GameEmulatorReason, string> = {
  game: 'gameOptions.reasons.game',
  'last-session': 'gameOptions.reasons.lastSession',
  'platform-default': 'gameOptions.reasons.platformDefault',
  'first-installed': 'gameOptions.reasons.firstInstalled'
}

/** The key, in the `common` namespace, of why a game plays with its emulator. */
export function emulatorReasonKey(reason: GameEmulatorReason): string {
  return REASON_KEYS[reason]
}

/**
 * The name of `choice` among `emulators`, or the id of its option (or emulator) when it isn't
 * one of them.
 */
export function getChoiceName(choice: EmulatorChoice, emulators: PlatformEmulator[]): string {
  const emulator = emulators.find((candidate) => isSameEmulator(choice, candidate))
  return emulator ? getEmulatorName(emulator) : (choice.optionId ?? choice.emulatorId)
}
