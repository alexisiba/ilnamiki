import { readdir, readFile, stat } from 'fs/promises'
import { homedir } from 'os'
import { join } from 'path'

import type { CoresReader, DetectedCore } from '../installedPlatforms.types'
import { parseCoreFolders, parseCoreInfo, type RetroArchCoreFolders } from '../retroarch.parsers'
import {
  coreIdOf,
  coreInfoFileOf,
  coreLibraryFileOf,
  resolveRetroArchFolder
} from './linux.parsers'

async function isFolder(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory()
  } catch {
    return false
  }
}

/** The file's text, or null when it can't be read (e.g. it doesn't exist). */
async function readText(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8')
  } catch {
    return null
  }
}

/**
 * The home and configuration folders an AppImage runs with. Its runtime makes the folders
 * `<AppImage>.home` and `<AppImage>.config` its home and configuration folders when they exist
 * (a portable install), and otherwise keeps the user's.
 */
async function appImageFolders(executablePath: string): Promise<{ home: string; config: string }> {
  const portableHome = `${executablePath}.home`
  const portableConfig = `${executablePath}.config`
  const home = (await isFolder(portableHome)) ? portableHome : homedir()
  if (await isFolder(portableConfig)) return { home, config: portableConfig }
  return { home, config: process.env.XDG_CONFIG_HOME || join(home, '.config') }
}

/** The folders of the cores and their info files that a RetroArch AppImage's configuration sets. */
async function coreFoldersOf(executablePath: string): Promise<RetroArchCoreFolders> {
  const { home, config } = await appImageFolders(executablePath)
  const retroArchFolder = join(config, 'retroarch')
  const configText = (await readText(join(retroArchFolder, 'retroarch.cfg'))) ?? ''
  return parseCoreFolders(configText, (value) =>
    resolveRetroArchFolder(value, home, join(retroArchFolder, 'cores'))
  )
}

/**
 * Reads the cores of a RetroArch AppImage: the libraries in the cores folder its configuration
 * sets, each one described by its info file. A core without an info file, or whose info file
 * doesn't say which platform it plays, is left out.
 */
async function readRetroArchCores(executablePath: string): Promise<DetectedCore[]> {
  const folders = await coreFoldersOf(executablePath)

  let fileNames: string[]
  try {
    fileNames = await readdir(folders.cores)
  } catch {
    return []
  }

  const ids = fileNames.map(coreIdOf).filter((id) => id !== null)
  const cores = await Promise.all(
    ids.map(async (id) => {
      const infoText = await readText(join(folders.info, coreInfoFileOf(id)))
      return infoText === null ? null : parseCoreInfo(id, infoText)
    })
  )
  return cores.filter((core) => core !== null)
}

/** The library of the core `coreId` in a RetroArch AppImage's cores folder, if it is there. */
async function findRetroArchCoreLibrary(
  executablePath: string,
  coreId: string
): Promise<string | null> {
  const folders = await coreFoldersOf(executablePath)
  const libraryPath = join(folders.cores, coreLibraryFileOf(coreId))
  try {
    return (await stat(libraryPath)).isFile() ? libraryPath : null
  } catch {
    return null
  }
}

export const linuxCoresReader: CoresReader = {
  readRetroArchCores,
  findRetroArchCoreLibrary
}
