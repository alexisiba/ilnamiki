import type { DetectedCore } from './platforms.types'

/** RetroArch's value for a setting left to its default, e.g. `libretro_directory = "default"`. */
const DEFAULT_VALUE = 'default'

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
 * The core `id` as its info file describes it, or null when the file doesn't say which
 * platform it plays. Its name falls back to the id when it declares none.
 */
export function parseCoreInfo(id: string, infoText: string): DetectedCore | null {
  const settings = parseRetroArchSettings(infoText)
  const platformId = settings.get('systemid')
  const platformName = settings.get('systemname')
  if (!platformId || !platformName) return null

  const extensions = (settings.get('supported_extensions') ?? '')
    .split('|')
    .map((extension) => extension.trim().toLowerCase())
    .filter((extension) => extension.length > 0)

  return {
    id,
    name: settings.get('corename') || id,
    platformId,
    platformName,
    extensions: [...new Set(extensions)]
  }
}
