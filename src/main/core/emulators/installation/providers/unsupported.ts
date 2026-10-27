import type { EmulatorInstallation } from '../installation.types'

/** Operating systems Ilnamiki doesn't support yet run the file, without knowing its folders. */
export function unsupportedInstallation(executablePath: string): EmulatorInstallation {
  return {
    command: (args) => ({ file: executablePath, args }),
    folders: async () => null
  }
}
