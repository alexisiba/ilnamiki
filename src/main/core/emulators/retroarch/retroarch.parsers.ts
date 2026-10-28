import { join } from 'path'

import type { GameDatabase } from '../emulatorModules.types'
import type { RetroArchCore } from './retroarch.types'

/** RetroArch's value for a setting left to its default, e.g. `libretro_directory = "default"`. */
const DEFAULT_VALUE = 'default'

/** Reads "Version: 1.22.2 (Git b40db22) Sep 25 2026", as `--version` prints it, as "1.22.2". */
export function parseRetroArchVersion(output: string): string | null {
  return /^Version:\s*(\S+)/m.exec(output)?.[1] ?? null
}

/**
 * The settings of a RetroArch file of `key = "value"` lines, as its configuration and its core
 * info files are written. Comments, empty lines and anything else are skipped; quotes around a
 * value are optional.
 */
export function parseRetroArchSettings(text: string): Map<string, string> {
  const settings = new Map<string, string>()
  for (const line of text.split(/\r?\n/)) {
    const match = /^\s*([\w.-]+)\s*=\s*(.*?)\s*$/.exec(line)
    if (!match) continue
    const [, key, raw] = match
    const value = /^"(.*)"$/.exec(raw)?.[1] ?? raw
    settings.set(key, value)
  }
  return settings
}

/** The folders RetroArch keeps its cores in, as its configuration sets them. */
export interface RetroArchCoreFolders {
  /** Where the cores' libraries are. */
  cores: string
  /** Where the cores' info files are. */
  info: string
}

/**
 * The folders of RetroArch's cores from its configuration's text, each one turned into a path
 * by `resolve`, which gets null for a folder left to its default.
 */
export function parseCoreFolders(
  configText: string,
  resolve: (value: string | null) => string
): RetroArchCoreFolders {
  const settings = parseRetroArchSettings(configText)
  const folder = (key: string): string => {
    const value = settings.get(key)
    return resolve(!value || value === DEFAULT_VALUE ? null : value)
  }
  return { cores: folder('libretro_directory'), info: folder('libretro_info_path') }
}

/**
 * The folder of RetroArch's game databases from its configuration's text, turned into a path
 * by `resolve`, which gets null for a folder left to its default.
 */
export function parseDatabaseFolder(
  configText: string,
  resolve: (value: string | null) => string
): string {
  const value = parseRetroArchSettings(configText).get('content_database_path')
  return resolve(!value || value === DEFAULT_VALUE ? null : value)
}

/** The values of a setting that lists several, e.g. `database = "Sega - 32X|Sega - Saturn"`. */
const listOf = (value: string | undefined): string[] =>
  (value ?? '')
    .split('|')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

/**
 * The core `id` as its info file describes it, or null when the file doesn't say which
 * platform it plays. Its name falls back to the id when it declares none.
 */
export function parseCoreInfo(id: string, infoText: string): RetroArchCore | null {
  const settings = parseRetroArchSettings(infoText)
  const platformId = settings.get('systemid')
  const platformName = settings.get('systemname')
  if (!platformId || !platformName) return null

  const extensions = listOf(settings.get('supported_extensions')).map((extension) =>
    extension.toLowerCase()
  )

  return {
    id,
    name: settings.get('corename') || id,
    platformId,
    platformName,
    platformManufacturer: settings.get('manufacturer') || null,
    extensions: [...new Set(extensions)],
    databases: [...new Set(listOf(settings.get('database')))]
  }
}

/**
 * The game databases RetroArch's `cores` name, as files `<name>.rdb` of the database folder
 * `folder`: one per platform and name, whether or not the file is there.
 */
export function gameDatabasesOf(cores: RetroArchCore[], folder: string): GameDatabase[] {
  const databases = new Map<string, GameDatabase>()
  for (const { platformId, databases: names } of cores) {
    for (const name of names) {
      databases.set(`${platformId}\n${name}`, {
        platformId,
        format: 'libretro-rdb',
        name,
        path: join(folder, `${name}.rdb`)
      })
    }
  }
  return [...databases.values()]
}
