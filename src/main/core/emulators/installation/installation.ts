import { selectForPlatform } from '../../platform'
import type { EmulatorInstallation } from './installation.types'
import { linuxInstallation } from './providers/linux'
import { unsupportedInstallation } from './providers/unsupported'

const createInstallation = selectForPlatform({ linux: linuxInstallation }, unsupportedInstallation)

/**
 * How the emulator whose application is at `executablePath` is installed. Each operating
 * system accepts one kind of installation for now (AppImages on Linux); when there are more,
 * the emulators table records which one each emulator is.
 */
export function installationOf(executablePath: string): EmulatorInstallation {
  return createInstallation(executablePath)
}
