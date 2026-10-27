import { stat } from 'fs/promises'
import { homedir } from 'os'
import { join } from 'path'

import type { EmulatorInstallation, InstallationFolders } from '../installation.types'

async function isFolder(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory()
  } catch {
    return false
  }
}

/**
 * The folders an AppImage runs with. Its runtime makes the folders `<AppImage>.home` and
 * `<AppImage>.config` its home and configuration folders when they exist (a portable install),
 * and otherwise keeps the user's. Its data folder follows its home, as for any program.
 */
async function appImageFolders(executablePath: string): Promise<InstallationFolders> {
  const portableHome = `${executablePath}.home`
  const portableConfig = `${executablePath}.config`
  const home = (await isFolder(portableHome)) ? portableHome : homedir()
  const config = (await isFolder(portableConfig))
    ? portableConfig
    : process.env.XDG_CONFIG_HOME || join(home, '.config')
  const data = process.env.XDG_DATA_HOME || join(home, '.local', 'share')
  return { home, config, data }
}

/** On Linux, emulators are AppImages for now: the file itself is run. */
export function linuxInstallation(executablePath: string): EmulatorInstallation {
  return {
    command: (args) => ({ file: executablePath, args }),
    folders: () => appImageFolders(executablePath)
  }
}
