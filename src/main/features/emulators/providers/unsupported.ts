import type { EmulatorDetector } from '../emulators.types'

/** Platforms Ilnamiki can't read emulators on yet support none of their formats. */
export const unsupportedEmulatorDetector: EmulatorDetector = {
  detect: async () => ({ ok: false, problem: 'unsupported-format' })
}
