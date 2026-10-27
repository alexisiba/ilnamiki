import type { EmulatorOption } from '../emulators'

/** The options one of the user's emulators has now. */
export interface EmulatorOptions {
  emulatorId: string
  /** As the user named it, e.g. "RetroArch". */
  emulatorName: string
  options: EmulatorOption[]
}
