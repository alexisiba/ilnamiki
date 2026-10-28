import { execFile } from 'child_process'
import { app } from 'electron'
import { mkdir, stat, writeFile } from 'fs/promises'
import { join } from 'path'
import { promisify } from 'util'

import { selectForPlatform } from '../../platform'
import type { EmulatorModule } from '../emulatorModules.types'
import type { EmulatorInstallation } from '../installation'
import { linuxCoresReader } from './providers/linux'
import { unsupportedCoresReader } from './providers/unsupported'
import { retroArchLaunchArgs, retroArchOverridesText } from './retroarch.launch'
import { gameDatabasesOf, parseRetroArchVersion } from './retroarch.parsers'

/** Longest RetroArch may take to print its version. */
const VERSION_TIMEOUT_MS = 15_000

const execFileAsync = promisify(execFile)

const reader = selectForPlatform({ linux: linuxCoresReader }, unsupportedCoresReader)

/** The version RetroArch prints, or null when it can't be read. */
async function readVersion(installation: EmulatorInstallation): Promise<string | null> {
  const { file, args } = installation.command(['--version'])
  try {
    const { stdout, stderr } = await execFileAsync(file, args, { timeout: VERSION_TIMEOUT_MS })
    return parseRetroArchVersion(`${stdout}\n${stderr}`)
  } catch {
    return null
  }
}

/**
 * Writes Ilnamiki's RetroArch settings to the app's data folder, fresh on every launch so
 * they always match this version of the app. Returns the file's path.
 */
async function writeOverrides(): Promise<string> {
  const folder = join(app.getPath('userData'), 'retroarch')
  await mkdir(folder, { recursive: true })
  const path = join(folder, 'overrides.cfg')
  await writeFile(path, retroArchOverridesText(), 'utf8')
  return path
}

/** Whether there is a file at `path`. */
async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

/**
 * RetroArch plays each platform with its installed cores: each core is one of its options,
 * and it reads which platform each plays from the core's info file.
 */
export const retroArchModule: EmulatorModule = {
  kind: 'retroarch',
  desktopIds: ['com.libretro.RetroArch', 'retroarch'],

  // Its AppImage declares no version, so RetroArch is asked for it.
  readVersion: (installation) => readVersion(installation),

  async listOptions(installation) {
    const cores = await reader.readCores(installation)
    return cores.map((core) => ({
      id: core.id,
      name: core.name,
      platform: {
        id: core.platformId,
        name: core.platformName,
        manufacturer: core.platformManufacturer
      },
      extensions: core.extensions
    }))
  },

  async prepareLaunch(installation, { optionId, gamePath }) {
    if (optionId === null) return null
    const coreLibraryPath = await reader.findCoreLibrary(installation, optionId)
    if (coreLibraryPath === null) return null
    const overridesPath = await writeOverrides()
    return { args: retroArchLaunchArgs({ coreLibraryPath, overridesPath, gamePath }), env: {} }
  },

  // Nothing else is changed, so what the user sets up there is saved as RetroArch saves it.
  prepareOpen: async () => ({ args: ['--fullscreen'], env: {} }),

  // Each core's info file names the databases of its platform; RetroArch downloads them to
  // its database folder, so only those the user has are listed.
  async listGameDatabases(installation) {
    const folder = await reader.findDatabaseFolder(installation)
    if (folder === null) return []
    const databases = gameDatabasesOf(await reader.readCores(installation), folder)
    const present = await Promise.all(databases.map(({ path }) => isFile(path)))
    return databases.filter((_, index) => present[index])
  }
}
