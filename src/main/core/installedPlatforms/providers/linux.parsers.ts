import { posix } from 'path'

/** End of a core's library file name on Linux, e.g. "mupen64plus_next_libretro.so". */
const CORE_LIBRARY_SUFFIX = '_libretro.so'

/**
 * A folder RetroArch's configuration sets, as a path: `~` stands for the home folder RetroArch
 * runs with. A folder left to its default (null), or set to a path that isn't absolute, is
 * `defaultFolder`.
 */
export function resolveRetroArchFolder(
  value: string | null,
  home: string,
  defaultFolder: string
): string {
  if (value === null) return defaultFolder
  if (value === '~') return home
  if (value.startsWith('~/')) return posix.join(home, value.slice(2))
  return posix.isAbsolute(value) ? posix.normalize(value) : defaultFolder
}

/**
 * The id of the core whose library is `fileName` (e.g. "mupen64plus_next" for
 * "mupen64plus_next_libretro.so"), or null when the file isn't a core's library.
 */
export function coreIdOf(fileName: string): string | null {
  if (!fileName.endsWith(CORE_LIBRARY_SUFFIX)) return null
  const id = fileName.slice(0, -CORE_LIBRARY_SUFFIX.length)
  return id.length > 0 ? id : null
}

/** Name of the library of the core `id`, e.g. "mupen64plus_next_libretro.so". */
export const coreLibraryFileOf = (id: string): string => `${id}${CORE_LIBRARY_SUFFIX}`

/** Name of the info file of the core `id`, e.g. "mupen64plus_next_libretro.info". */
export const coreInfoFileOf = (id: string): string => `${id}_libretro.info`
