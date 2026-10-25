import { posix } from 'path'

/** Bytes of a file's start needed to tell whether it is an AppImage. */
export const APPIMAGE_HEADER_LENGTH = 11

/**
 * Whether `header` (a file's first bytes) is a type 2 AppImage's: an ELF executable with the
 * AppImage magic "AI" 0x02 at byte 8.
 */
export function isAppImageHeader(header: Uint8Array): boolean {
  if (header.length < APPIMAGE_HEADER_LENGTH) return false
  const isElf = header[0] === 0x7f && header[1] === 0x45 && header[2] === 0x4c && header[3] === 0x46
  return isElf && header[8] === 0x41 && header[9] === 0x49 && header[10] === 0x02
}

/** What Ilnamiki reads from a desktop entry. */
export interface DesktopEntry {
  /** Untranslated `Name`, or null without one. */
  name: string | null
  /** `Icon`: an icon name (e.g. "com.libretro.RetroArch") or a path; null without one. */
  icon: string | null
}

/**
 * The `[Desktop Entry]` group of a desktop entry file. Translated keys (`Name[es]`) and other
 * groups (e.g. actions) are ignored.
 */
export function parseDesktopEntry(text: string): DesktopEntry {
  const entry: DesktopEntry = { name: null, icon: null }
  let inMainGroup = false

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (line.startsWith('[')) {
      inMainGroup = line === '[Desktop Entry]'
      continue
    }
    if (!inMainGroup || line.startsWith('#')) continue

    const separator = line.indexOf('=')
    if (separator === -1) continue
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim()
    if (!value) continue
    if (key === 'Name') entry.name = value
    if (key === 'Icon') entry.icon = value
  }

  return entry
}

/** The desktop id of a desktop entry file name: "com.libretro.RetroArch.desktop" → its id. */
export function desktopIdOf(fileName: string): string {
  return fileName.replace(/\.desktop$/, '')
}

/**
 * Where a symbolic link at `linkPath` (relative to an AppImage's root) points, relative to the
 * same root; null when it points outside it or to an absolute path.
 */
export function resolveLinkInside(linkPath: string, target: string): string | null {
  if (posix.isAbsolute(target)) return null
  const resolved = posix.normalize(posix.join(posix.dirname(linkPath), target))
  return resolved.startsWith('..') ? null : resolved
}

const ICON_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
}

/** Media type of an icon file by its extension, or null for formats Ilnamiki doesn't show. */
export function iconTypeOf(fileName: string): string | null {
  return ICON_TYPES[posix.extname(fileName).toLowerCase()] ?? null
}
