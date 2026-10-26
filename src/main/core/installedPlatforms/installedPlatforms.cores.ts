import type { CoreRef, InstalledCore } from '@shared/api'

/** Emulator ids are UUIDs. */
const EMULATOR_ID_PATTERN = /^[0-9a-f-]{36}$/

/** Core ids are short words, e.g. "mupen64plus_next". */
const CORE_ID_PATTERN = /^[\w-]{1,100}$/

/** Whether `core` is one of `cores`: the same core of the same emulator. */
export function isAmongCores(core: CoreRef, cores: InstalledCore[]): boolean {
  return cores.some(({ id, emulatorId }) => id === core.coreId && emulatorId === core.emulatorId)
}

/** `value` as a core of an emulator, or null when the renderer sent something else. */
export function parseCoreRef(value: unknown): CoreRef | null {
  if (typeof value !== 'object' || value === null) return null
  const { emulatorId, coreId } = value as Record<string, unknown>
  if (typeof emulatorId !== 'string' || !EMULATOR_ID_PATTERN.test(emulatorId)) return null
  if (typeof coreId !== 'string' || !CORE_ID_PATTERN.test(coreId)) return null
  return { emulatorId, coreId }
}
