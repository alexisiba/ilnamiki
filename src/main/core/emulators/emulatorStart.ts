import type { EmulatorRecord } from './emulators.repository'
import { findModule } from './emulatorModules'
import type { LaunchPlan, LaunchRequest } from './emulatorModules.types'
import { installationOf, type InstallationCommand } from './installation'

/** What to run to start an emulator, ready for `startEmulator`. */
export interface EmulatorStart {
  command: InstallationCommand
  /** Variables added to Ilnamiki's own environment. */
  env: Record<string, string>
}

const toStart = (emulator: EmulatorRecord, { args, env }: LaunchPlan): EmulatorStart => ({
  command: installationOf(emulator.executablePath).command(args),
  env
})

/**
 * How to start a game with `emulator` and one of its options, as its module prepares it. Null
 * when Ilnamiki doesn't know the emulator or it can't play that way anymore.
 */
export async function prepareGameStart(
  emulator: EmulatorRecord,
  request: LaunchRequest
): Promise<EmulatorStart | null> {
  const module = findModule(emulator.kind)
  if (!module) return null
  const plan = await module.prepareLaunch(installationOf(emulator.executablePath), request)
  return plan && toStart(emulator, plan)
}

/**
 * How to open `emulator` alone to be set up, as its module prepares it. An emulator Ilnamiki
 * doesn't know is run without arguments.
 */
export async function prepareOpenStart(emulator: EmulatorRecord): Promise<EmulatorStart> {
  const module = findModule(emulator.kind)
  if (!module) return toStart(emulator, { args: [], env: {} })
  return toStart(emulator, await module.prepareOpen(installationOf(emulator.executablePath)))
}
