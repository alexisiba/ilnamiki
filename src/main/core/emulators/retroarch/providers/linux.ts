import { readdir, readFile, stat } from 'fs/promises'
import { join } from 'path'

import type { EmulatorInstallation } from '../../installation'
import { parseCoreFolders, parseCoreInfo, type RetroArchCoreFolders } from '../retroarch.parsers'
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

/**
 * The folders of the cores and their info files that RetroArch's configuration sets, or null
 * when the installation's folders can't be known.
 */
async function coreFoldersOf(
  installation: EmulatorInstallation
): Promise<RetroArchCoreFolders | null> {
  const folders = await installation.folders()
  if (!folders) return null
  const retroArchFolder = join(folders.config, 'retroarch')
  const configText = (await readText(join(retroArchFolder, 'retroarch.cfg'))) ?? ''
  return parseCoreFolders(configText, (value) =>
    resolveRetroArchFolder(value, folders.home, join(retroArchFolder, 'cores'))
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
  findCoreLibrary
}
