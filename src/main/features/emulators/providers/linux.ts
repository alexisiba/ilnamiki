import { execFile } from 'child_process'
import { constants } from 'fs'
import { access, lstat, mkdtemp, open, readFile, readdir, readlink, rm, stat } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { promisify } from 'util'

import type { EmulatorProblem } from '@shared/api'

import { findModuleByDesktopId, installationOf } from '../../../core/emulators'
import type { DetectEmulatorResult, EmulatorDetector, EmulatorIcon } from '../emulators.types'
import {
  APPIMAGE_HEADER_LENGTH,
  desktopIdOf,
  iconTypeOf,
  isAppImageHeader,
  parseDesktopEntry,
  resolveLinkInside
} from './linux.parsers'

/** Longest an AppImage may take to extract a file. */
const APPIMAGE_TIMEOUT_MS = 15_000

/** Symbolic links followed inside an AppImage before giving up (they can chain). */
const MAX_LINKS = 4

/** Folder an AppImage extracts its files into, inside the folder it runs in. */
const EXTRACTED_ROOT = 'squashfs-root'

const execFileAsync = promisify(execFile)

const errorCode = (error: unknown): string | undefined =>
  error instanceof Error && 'code' in error ? String(error.code) : undefined

/** Why the file at `path` can't be an emulator's AppImage, or null when it can. */
async function checkAppImage(path: string): Promise<EmulatorProblem | null> {
  try {
    if (!(await stat(path)).isFile()) return 'not-a-file'
  } catch (error) {
    if (errorCode(error) === 'ENOENT' || errorCode(error) === 'ENOTDIR') return 'not-found'
    throw error
  }

  try {
    await access(path, constants.X_OK)
  } catch {
    return 'not-executable'
  }

  const file = await open(path, 'r')
  try {
    const header = new Uint8Array(APPIMAGE_HEADER_LENGTH)
    await file.read(header, 0, APPIMAGE_HEADER_LENGTH, 0)
    return isAppImageHeader(header) ? null : 'unsupported-format'
  } finally {
    await file.close()
  }
}

/**
 * Extracts the files of `appImage` that match `pattern` into `folder`, without running the
 * application: the AppImage runtime only copies them out of the image.
 */
async function extract(appImage: string, folder: string, pattern: string): Promise<void> {
  await execFileAsync(appImage, ['--appimage-extract', pattern], {
    cwd: folder,
    timeout: APPIMAGE_TIMEOUT_MS
  })
}

/**
 * The extracted file at `relativePath` (from the AppImage's root), extracting it and following
 * its symbolic links, which only point inside the image. Null when it isn't there.
 */
async function extractFile(
  appImage: string,
  folder: string,
  relativePath: string
): Promise<string | null> {
  let current = relativePath
  for (let links = 0; links <= MAX_LINKS; links++) {
    await extract(appImage, folder, current)
    const path = join(folder, EXTRACTED_ROOT, current)
    try {
      if (!(await lstat(path)).isSymbolicLink()) return path
    } catch {
      return null
    }
    const target = resolveLinkInside(current, await readlink(path))
    if (target === null) return null
    current = target
  }
  return null
}

/** Names of the files at the root of what was extracted, e.g. its desktop entry. */
async function extractedRootFiles(folder: string): Promise<string[]> {
  try {
    return await readdir(join(folder, EXTRACTED_ROOT))
  } catch {
    return []
  }
}

/** The AppImage's icon `name`, looked for at its root as PNG or SVG. */
async function readIcon(
  appImage: string,
  folder: string,
  name: string
): Promise<EmulatorIcon | null> {
  await extract(appImage, folder, `${name}.*`)
  for (const fileName of await extractedRootFiles(folder)) {
    const mimeType = iconTypeOf(fileName)
    if (!fileName.startsWith(`${name}.`) || mimeType === null) continue
    const path = await extractFile(appImage, folder, fileName)
    if (path) return { data: await readFile(path), mimeType }
  }
  return null
}

/**
 * Detects an emulator packaged as an AppImage. Its desktop entry and icon are extracted into
 * a temporary folder, which is always deleted afterwards; only a recognized emulator's module
 * reads its version, running it when its AppImage doesn't declare it.
 */
async function detectAppImage(path: string): Promise<DetectEmulatorResult> {
  const problem = await checkAppImage(path)
  if (problem) return { ok: false, problem }

  const { mtimeMs } = await stat(path)
  const folder = await mkdtemp(join(tmpdir(), 'ilnamiki-appimage-'))
  try {
    await extract(path, folder, '*.desktop')
    const desktopFile = (await extractedRootFiles(folder)).find((name) => name.endsWith('.desktop'))
    const desktopPath = desktopFile ? await extractFile(path, folder, desktopFile) : null
    const entry = desktopPath ? parseDesktopEntry(await readFile(desktopPath, 'utf8')) : null
    const known = desktopFile ? findModuleByDesktopId(desktopIdOf(desktopFile)) : undefined
    // AppImages name their icon; an icon given as a path would point outside the image.
    const icon =
      entry?.icon && !entry.icon.includes('/') ? await readIcon(path, folder, entry.icon) : null

    return {
      ok: true,
      detected: {
        kind: known?.kind ?? 'unknown',
        name: entry?.name ?? null,
        version: known
          ? await known.readVersion(installationOf(path), entry?.version ?? null)
          : null,
        icon,
        fileModifiedAt: Math.round(mtimeMs)
      }
    }
  } finally {
    await rm(folder, { recursive: true, force: true })
  }
}

/** On Linux, emulators are AppImages for now. */
export const linuxEmulatorDetector: EmulatorDetector = {
  detect: detectAppImage
}
