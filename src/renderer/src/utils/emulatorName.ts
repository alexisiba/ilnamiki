import type { EmulatorChoice, PlatformEmulator } from '@shared/api'

/**
 * How `emulator` is named in the app: the emulator's name, followed by its option's when it
 * has one (e.g. "RetroArch · Snes9x"), so emulators with several options can be told apart.
 * Neither name is translated.
 */
export function getEmulatorName({ emulatorName, optionName }: PlatformEmulator): string {
  return optionName === null ? emulatorName : `${emulatorName} · ${optionName}`
}

/** Whether `choice` names `emulator`: the same option of the same emulator. */
export function isSameEmulator(choice: EmulatorChoice, emulator: PlatformEmulator): boolean {
  return choice.emulatorId === emulator.emulatorId && choice.optionId === emulator.optionId
}
