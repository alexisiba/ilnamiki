import type { EmulatorKind } from '@shared/api'

import { edenModule } from './eden'
import type { EmulatorModule } from './emulatorModules.types'
import { retroArchModule } from './retroarch'

/** The emulators Ilnamiki knows, one module each. */
export const EMULATOR_MODULES: EmulatorModule[] = [retroArchModule, edenModule]

/** The module of the emulator `kind`, or undefined for an emulator Ilnamiki doesn't know. */
export function findModule(kind: EmulatorKind): EmulatorModule | undefined {
  return EMULATOR_MODULES.find((module) => module.kind === kind)
}

/** The module whose emulator's desktop entry is `desktopId`, if any. */
export function findModuleByDesktopId(desktopId: string): EmulatorModule | undefined {
  return EMULATOR_MODULES.find((module) => module.desktopIds.includes(desktopId))
}
