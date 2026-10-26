/** Files that point to the other files of a game, which it is opened by. */
export type IndexKind =
  /** A playlist of the discs of a game, e.g. "Final Fantasy VII (USA).m3u". */
  | 'm3u'
  /** A cue sheet: a disc image's tracks, e.g. "Crash Bandicoot (USA).cue" and its .bin. */
  | 'cue'
  /** A GD-ROM's tracks (Dreamcast). */
  | 'gdi'
  /** A CloneCD image, whose .img (and .sub) share its name. */
  | 'ccd'

const INDEX_KINDS: Record<string, IndexKind> = {
  m3u: 'm3u',
  cue: 'cue',
  gdi: 'gdi',
  ccd: 'ccd'
}

/** Extension of the file at `path`, lowercase and without the dot; empty without one. */
export function extensionOf(path: string): string {
  const name = path.slice(path.lastIndexOf('/') + 1)
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : ''
}

/** Name of the file at `path` without its extension, e.g. "Crash Bandicoot (USA)". */
export function titleOf(path: string): string {
  const name = path.slice(path.lastIndexOf('/') + 1)
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(0, dot) : name
}

/** Which kind of index the file at `path` is, or null when it isn't one. */
export function indexKindOf(path: string): IndexKind | null {
  return INDEX_KINDS[extensionOf(path)] ?? null
}

/** Character some editors write at the start of a text file. */
const BYTE_ORDER_MARK = String.fromCharCode(0xfeff)

/** The text's lines, without a byte order mark or line endings. */
function linesOf(text: string): string[] {
  const withoutMark = text.startsWith(BYTE_ORDER_MARK) ? text.slice(1) : text
  return withoutMark.split(/\r?\n/)
}

/** Files a cue sheet's `FILE` lines name, as written, e.g. `FILE "Game (Track 1).bin" BINARY`. */
export function parseCueFiles(text: string): string[] {
  const files: string[] = []
  for (const line of linesOf(text)) {
    const match = /^\s*FILE\s+(?:"([^"]*)"|(\S+))/i.exec(line)
    const file = match?.[1] ?? match?.[2]
    if (file) files.push(file)
  }
  return files
}

/**
 * Files a .gdi names, as written. After the track count, each line is a track:
 * `<number> <sector> <type> <sector size> <file> <offset>`, the file quoted when it has spaces.
 */
export function parseGdiFiles(text: string): string[] {
  const files: string[] = []
  for (const line of linesOf(text)) {
    const match = /^\s*\d+\s+\d+\s+\d+\s+\d+\s+(?:"([^"]+)"|(\S+))/.exec(line)
    const file = match?.[1] ?? match?.[2]
    if (file) files.push(file)
  }
  return files
}

/** Discs a playlist lists, as written: one per line, skipping empty lines and `#` comments. */
export function parseM3uEntries(text: string): string[] {
  return linesOf(text)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
}
