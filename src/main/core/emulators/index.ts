export { EMULATOR_MODULES, findModule, findModuleByDesktopId } from './emulatorModules'
export type {
  EmulatorModule,
  EmulatorOption,
  KnownEmulatorKind,
  LaunchPlan,
  LaunchRequest,
  OptionPlatform
} from './emulatorModules.types'
export { type EmulatorStart, prepareGameStart, prepareOpenStart } from './emulatorStart'
export {
  createEmulatorsRepository,
  type EmulatorRecord,
  type EmulatorsRepository
} from './emulators.repository'
export { type EmulatorInstallation, installationOf } from './installation'
