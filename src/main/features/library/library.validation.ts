import { isAbsolute, resolve } from 'path'

import type { ScanFolderRequest } from '@shared/api'

/** Longest path accepted, in characters; far beyond any real one. */
const PATH_MAX_LENGTH = 4096

/** Platform ids are short words, e.g. "nintendo_64". */
const PLATFORM_ID_PATTERN = /^[\w-]{1,100}$/

/** Scan ids are UUIDs. */
const SCAN_ID_PATTERN = /^[0-9a-f-]{36}$/

/**
 * `value` as a request to scan a folder, its path written one way only (e.g. without a
 * trailing `/`, so a folder is never added twice), or null when the renderer sent something
 * else.
 */
export function parseScanFolderRequest(value: unknown): ScanFolderRequest | null {
  if (typeof value !== 'object' || value === null) return null
  const { path, platformId } = value as Record<string, unknown>

  if (typeof path !== 'string' || path.length > PATH_MAX_LENGTH || !isAbsolute(path)) return null
  if (typeof platformId !== 'string' || !PLATFORM_ID_PATTERN.test(platformId)) return null

  return { path: resolve(path), platformId }
}

/** `value` as a scan id, or null when it can't be one. */
export function parseScanId(value: unknown): string | null {
  return typeof value === 'string' && SCAN_ID_PATTERN.test(value) ? value : null
}
