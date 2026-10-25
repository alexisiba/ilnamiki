import type { Dirent } from 'fs'
import { readdir, readFile, stat } from 'fs/promises'
import { join, resolve } from 'path'

import type { FolderReader, ReadFolderOptions, ReadFolderResult } from '../library.types'
import { indexKindOf } from '../library.parsers'
import { scanFraction } from '../library.progress'

/** Largest index file read; a bigger one isn't a real playlist or cue sheet. */
const INDEX_MAX_BYTES = 1024 * 1024

const errorCode = (error: unknown): string | undefined =>
  error instanceof Error && 'code' in error ? String(error.code) : undefined

/** Whether the entry is a file, following a symbolic link to see what it points to. */
async function isFile(folder: string, entry: Dirent): Promise<boolean> {
  if (entry.isFile()) return true
  if (!entry.isSymbolicLink()) return false
  try {
    return (await stat(join(folder, entry.name))).isFile()
  } catch {
    return false
  }
}

/** Names of the files among the `entries` of `folder`. */
async function fileNamesIn(folder: string, entries: Dirent[]): Promise<string[]> {
  const names: string[] = []
  for (const entry of entries) {
    if (await isFile(folder, entry)) names.push(entry.name)
  }
  return names
}

/** The text of an index file, or null when it can't be read or is too big to be one. */
async function readIndex(path: string): Promise<string | null> {
  try {
    if ((await stat(path)).size > INDEX_MAX_BYTES) return null
    return await readFile(path, 'utf8')
  } catch {
    return null
  }
}

/**
 * Reads a folder of games: the files at its top and at the top of its subfolders (never
 * deeper, and never following links to folders), then the text of the indexes among them.
 * A subfolder that can't be read is left out.
 */
async function readFolder(
  path: string,
  { excludedFolders, signal, onProgress }: ReadFolderOptions
): Promise<ReadFolderResult> {
  try {
    if (!(await stat(path)).isDirectory()) return { ok: false, problem: 'not-a-folder' }
  } catch (error) {
    if (errorCode(error) === 'ENOENT' || errorCode(error) === 'ENOTDIR') {
      return { ok: false, problem: 'not-found' }
    }
    return { ok: false, problem: 'not-readable' }
  }

  let entries: Dirent[]
  try {
    entries = await readdir(path, { withFileTypes: true })
  } catch {
    return { ok: false, problem: 'not-readable' }
  }

  const excluded = new Set(excludedFolders.map((folder) => resolve(folder)))
  const files = await fileNamesIn(path, entries)
  const subfolders = entries
    .filter((entry) => entry.isDirectory() && !excluded.has(resolve(path, entry.name)))
    .map((entry) => entry.name)

  for (const [i, subfolder] of subfolders.entries()) {
    signal.throwIfAborted()
    onProgress(scanFraction('listing', i, subfolders.length))
    const folder = join(path, subfolder)
    try {
      const names = await fileNamesIn(folder, await readdir(folder, { withFileTypes: true }))
      files.push(...names.map((name) => `${subfolder}/${name}`))
    } catch {
      // Left out: nothing in it can be listed.
    }
  }

  // A CloneCD image names no file, so it has no text to read.
  const indexes = files.filter((file) => {
    const kind = indexKindOf(file)
    return kind !== null && kind !== 'ccd'
  })
  const indexTexts = new Map<string, string>()
  for (const [i, index] of indexes.entries()) {
    signal.throwIfAborted()
    onProgress(scanFraction('reading', i, indexes.length))
    const text = await readIndex(join(path, index))
    if (text !== null) indexTexts.set(index, text)
  }

  signal.throwIfAborted()
  onProgress(1)
  return { ok: true, files, indexTexts }
}

export const linuxFolderReader: FolderReader = {
  read: readFolder
}
