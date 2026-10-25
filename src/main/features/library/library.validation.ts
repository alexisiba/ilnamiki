import { isAbsolute } from 'path'

import type { ScanFolderRequest } from '@shared/api'

/** Longest path accepted, in characters; far beyond any real one. */
const PATH_MAX_LENGTH = 4096

/** Platform ids are short words, e.g. "nintendo_64". */
const PLATFORM_ID_PATTERN = /^[\w-]{1,100}$/

/** `value` as a request to scan a folder, or null when the renderer sent something else. */
export function parseScanFolderRequest(value: unknown): ScanFolderRequest | null {
  if (typeof value !== 'object' || value === null) return null
  const { path, platformId } = value as Record<string, unknown>

  if (typeof path !== 'string' || path.length > PATH_MAX_LENGTH || !isAbsolute(path)) return null
  if (typeof platformId !== 'string' || !PLATFORM_ID_PATTERN.test(platformId)) return null

  return { path, platformId }
}
