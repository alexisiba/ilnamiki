import { extname } from 'path'
import { crc32 } from 'zlib'

import type { FileReader } from './libretroDatabase.files'
import { ARCHIVE_EXTENSIONS, contentStartsOf, formatCrc } from './libretroDatabase.parsers'

/**
 * Largest file whose checksum is worked out: larger ones (disc images) take too long to read
 * and are recognized by their name only.
 */
const MAX_CHECKSUM_SIZE = 512 * 1024 * 1024

/** Bytes read from a file's start to tell its headers. */
const HEADER_PEEK_SIZE = 16

/** The CRCs of `chunks` from each of `starts`, worked out in one pass as they come. */
export async function crcsOf(
  chunks: AsyncIterable<Uint8Array>,
  starts: number[]
): Promise<string[]> {
  const crcs = starts.map(() => 0)
  let position = 0
  for await (const chunk of chunks) {
    starts.forEach((start, index) => {
      if (position + chunk.length > start) {
        crcs[index] = crc32(chunk.subarray(Math.max(0, start - position)), crcs[index])
      }
    })
    position += chunk.length
  }
  return crcs.map(formatCrc)
}

/**
 * The CRCs the game at `path` may have in a libretro database, read with `reader`: its file's,
 * and its file's without any header the databases don't count. None for an archive (known by
 * its name), an empty file, one too large to read, or one that can't be read.
 */
export async function checksumsOf(path: string, reader: FileReader): Promise<string[]> {
  if (ARCHIVE_EXTENSIONS.includes(extname(path).toLowerCase())) return []
  try {
    const size = await reader.size(path)
    if (size === 0 || size > MAX_CHECKSUM_SIZE) return []
    const start = await reader.readStart(path, HEADER_PEEK_SIZE)
    return await crcsOf(reader.chunks(path), contentStartsOf(size, start))
  } catch {
    return []
  }
}
