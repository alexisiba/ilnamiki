import { posix } from 'path'

import {
  extensionOf,
  indexKindOf,
  parseCueFiles,
  parseGdiFiles,
  parseM3uEntries,
  titleOf,
  type IndexKind
} from './library.parsers'

/** Why a game found in a folder can't be played. */
export type GameProblem =
  /** Files its index points to aren't there, as the index writes them. */
  | { kind: 'missing-files'; files: string[] }
  /** Its index points to no file, or couldn't be read. */
  | { kind: 'empty-index' }

/** A game found in a folder. */
export interface FoundGame {
  /** The file's name without its extension, e.g. "Crash Bandicoot (USA)". */
  title: string
  /** The file the emulator opens, relative to the folder with `/` separators. */
  path: string
  /** Why it can't be played, or null when it can. */
  problem: GameProblem | null
}

/** What is known about a folder of games to find them. */
export interface FolderContents {
  /**
   * Every file at the folder's top and at the top of its subfolders, relative to the folder
   * with `/` separators. Files in hidden folders, and hidden files, count only when an index
   * points to them.
   */
  files: string[]
  /** Text of the index files among `files` (.m3u, .cue, .gdi, .ccd), by path; none if unread. */
  indexTexts: ReadonlyMap<string, string>
  /** Extensions of the platform's games, lowercase and without the dot. */
  extensions: ReadonlySet<string>
}

/** The order indexes are read in: each one takes the files it points to from the next ones. */
const INDEX_PRIORITY: (IndexKind | null)[][] = [['m3u'], ['cue', 'gdi', 'ccd'], [null]]

const isHidden = (path: string): boolean =>
  path.split('/').some((segment) => segment.startsWith('.'))

const byTitle = (a: FoundGame, b: FoundGame): number =>
  a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }) || a.path.localeCompare(b.path)

/**
 * Finds the files the folder has, as an index writes them: exactly, else ignoring case (cue
 * sheets made on Windows often differ in case from the files).
 */
function createFileFinder(files: string[]): (path: string) => string | null {
  const exact = new Set(files)
  const ignoringCase = new Map<string, string>()
  for (const file of [...files].sort()) {
    if (!ignoringCase.has(file.toLowerCase())) ignoringCase.set(file.toLowerCase(), file)
  }
  return (path) => (exact.has(path) ? path : (ignoringCase.get(path.toLowerCase()) ?? null))
}

/**
 * Where a file an index writes is, relative to the folder: next to the index. A path written
 * absolute (often from another computer, e.g. `C:\Games\Game.bin`) is looked for by its name
 * next to the index.
 */
function referencedPath(indexPath: string, written: string): string {
  const path = written.replace(/\\/g, '/')
  const folder = posix.dirname(indexPath)
  const isAbsolute = path.startsWith('/') || /^[a-z]:\//i.test(path)
  return posix.normalize(posix.join(folder, isAbsolute ? posix.basename(path) : path))
}

/** Files the index at `path` points to, as it writes them, and those it may also have. */
function referencesOf(
  path: string,
  kind: IndexKind,
  indexTexts: ReadonlyMap<string, string>
): { required: string[]; optional: string[] } {
  // A CloneCD image names no file: its .img and .sub share its name.
  if (kind === 'ccd') {
    const name = posix.basename(path).slice(0, -'.ccd'.length)
    return { required: [`${name}.img`], optional: [`${name}.sub`] }
  }
  const text = indexTexts.get(path) ?? ''
  const parse = { m3u: parseM3uEntries, cue: parseCueFiles, gdi: parseGdiFiles }[kind]
  return { required: parse(text), optional: [] }
}

/**
 * The games in a folder, by title. Indexes come first: a playlist takes its discs, then a cue
 * sheet (or .gdi, .ccd) takes its tracks, so the files they point to aren't games of their
 * own; every other file with one of the platform's extensions is a game by itself. A game
 * whose index points to files that aren't there is still found, with its problem.
 */
export function findGames({ files, indexTexts, extensions }: FolderContents): FoundGame[] {
  const findFile = createFileFinder(files)
  const candidates = files
    .filter((file) => !isHidden(file) && extensions.has(extensionOf(file)))
    .sort()
  // Files an index already took, whether or not its game can be played.
  const taken = new Set<string>()

  /**
   * Takes the files the index at `indexPath` points to and, when they are indexes too, theirs.
   * Returns the required files that aren't there, as their index writes them.
   */
  function take(indexPath: string, kind: IndexKind, visited: Set<string>): string[] {
    visited.add(indexPath)
    const { required, optional } = referencesOf(indexPath, kind, indexTexts)
    const missing: string[] = []

    const takeFile = (file: string): void => {
      taken.add(file)
      const fileKind = indexKindOf(file)
      if (fileKind !== null && !visited.has(file)) missing.push(...take(file, fileKind, visited))
    }

    for (const written of required) {
      const file = findFile(referencedPath(indexPath, written))
      if (file === null) missing.push(written)
      else takeFile(file)
    }
    for (const written of optional) {
      const file = findFile(referencedPath(indexPath, written))
      if (file !== null) takeFile(file)
    }
    return missing
  }

  const games: FoundGame[] = []
  for (const kinds of INDEX_PRIORITY) {
    for (const file of candidates) {
      const kind = indexKindOf(file)
      if (taken.has(file) || !kinds.includes(kind)) continue

      let problem: GameProblem | null = null
      if (kind !== null) {
        const pointsToFiles = referencesOf(file, kind, indexTexts).required.length > 0
        const missing = take(file, kind, new Set())
        if (!pointsToFiles) problem = { kind: 'empty-index' }
        else if (missing.length > 0) problem = { kind: 'missing-files', files: missing }
      }
      games.push({ title: titleOf(file), path: file, problem })
    }
  }
  return games.sort(byTitle)
}
