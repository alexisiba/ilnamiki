import { readdir, readFile, stat } from 'fs/promises'
import { join } from 'path'

import type { EmulatorInstallation } from '../../installation'
import {
  parseCoreFolders,
  parseCoreInfo,
  parseDatabaseFolder,
  type RetroArchCoreFolders
} from '../retroarch.parsers'
import type { RetroArchCore, RetroArchCoresReader } from '../retroarch.types'
import {
  coreIdOf,
  coreInfoFileOf,
  coreLibraryFileOf,
  resolveRetroArchFolder
} from './linux.parsers'

/** The file's text, or null when it can't be read (e.g. it doesn't exist). */
async function readText(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8')
  } catch {
    return null
  }
}

/** RetroArch's configuration in `installation`, or null when its folders can't be known. */
async function readConfig(
  installation: EmulatorInstallation
): Promise<{ text: string; home: string; retroArchFolder: string } | null> {
  const folders = await installation.folders()
  if (!folders) return null
  const retroArchFolder = join(folders.config, 'retroarch')
  const text = (await readText(join(retroArchFolder, 'retroarch.cfg'))) ?? ''
  return { text, home: folders.home, retroArchFolder }
}

/**
 * The folders of the cores and their info files that RetroArch's configuration sets, or null
 * when the installation's folders can't be known.
 */
async function coreFoldersOf(
  installation: EmulatorInstallation
): Promise<RetroArchCoreFolders | null> {
  const config = await readConfig(installation)
  if (!config) return null
  return parseCoreFolders(config.text, (value) =>
    resolveRetroArchFolder(value, config.home, join(config.retroArchFolder, 'cores'))
  )
}

/** The folder of the game databases that RetroArch's configuration sets. */
async function findDatabaseFolder(installation: EmulatorInstallation): Promise<string | null> {
  const config = await readConfig(installation)
  if (!config) return null
  return parseDatabaseFolder(config.text, (value) =>
    resolveRetroArchFolder(value, config.home, join(config.retroArchFolder, 'database', 'rdb'))
  )
}

/**
 * Reads the cores of RetroArch: the libraries in the cores folder its configuration sets, each
 * one described by its info file. A core without an info file, or whose info file doesn't say
 * which platform it plays, is left out.
 */
async function readCores(installation: EmulatorInstallation): Promise<RetroArchCore[]> {
  const folders = await coreFoldersOf(installation)
  if (!folders) return []

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

/** The library of the core `coreId` in RetroArch's cores folder, if it is there. */
async function findCoreLibrary(
  installation: EmulatorInstallation,
  coreId: string
): Promise<string | null> {
  const folders = await coreFoldersOf(installation)
  if (!folders) return null
  const libraryPath = join(folders.cores, coreLibraryFileOf(coreId))
  try {
    return (await stat(libraryPath)).isFile() ? libraryPath : null
  } catch {
    return null
  }
}

export const linuxCoresReader: RetroArchCoresReader = {
  readCores,
  findCoreLibrary,
  findDatabaseFolder
}
