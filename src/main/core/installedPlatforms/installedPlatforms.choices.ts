import type { EmulatorChoice, PlatformEmulator } from '@shared/api'

/** Emulator ids are UUIDs. */
const EMULATOR_ID_PATTERN = /^[0-9a-f-]{36}$/

/** Option ids are short words, e.g. "mupen64plus_next". */
const OPTION_ID_PATTERN = /^[\w-]{1,100}$/

/** Whether `choice` is one of `emulators`: the same option of the same emulator. */
export function isAmongEmulators(choice: EmulatorChoice, emulators: PlatformEmulator[]): boolean {
  return emulators.some(
    ({ emulatorId, optionId }) => emulatorId === choice.emulatorId && optionId === choice.optionId
  )
}

/** `value` as an emulator and one of its options, or null when the renderer sent something else. */
export function parseEmulatorChoice(value: unknown): EmulatorChoice | null {
  if (typeof value !== 'object' || value === null) return null
  const { emulatorId, optionId } = value as Record<string, unknown>
  if (typeof emulatorId !== 'string' || !EMULATOR_ID_PATTERN.test(emulatorId)) return null
  if (optionId === null) return { emulatorId, optionId }
  if (typeof optionId !== 'string' || !OPTION_ID_PATTERN.test(optionId)) return null
  return { emulatorId, optionId }
}
