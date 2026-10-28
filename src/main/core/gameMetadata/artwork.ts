import { mkdir, rename, writeFile } from 'fs/promises'
import { dirname, join } from 'path'

import { type ArtworkKind, MetadataUnavailableError } from './gameMetadata.types'

/** Longest an image may take to download. */
const DOWNLOAD_TIMEOUT_MS = 20_000

/** Largest image kept; a larger one is taken as not being a game's image. */
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

/** File extension of each image type kept. */
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp'
}

/** Answers that mean the image isn't there; any other failure means it couldn't be asked. */
const MISSING_STATUSES = new Set([404, 410])

/** How artwork files are written. Tests pass one in memory. */
export interface ArtworkFiles {
  /** Writes `content` as the file at `path`, making its folder, replacing what was there. */
  write(path: string, content: Uint8Array): Promise<void>
}

/** Writes artwork files on disk, whole or not at all. */
export const diskArtworkFiles: ArtworkFiles = {
  async write(path, content) {
    await mkdir(dirname(path), { recursive: true })
    const partial = `${path}.part`
    await writeFile(partial, content)
    await rename(partial, path)
  }
}

export interface ArtworkDownloaderOptions {
  /** Where artwork is kept: one folder per game inside it. */
  folder: string
  /** Sent with every request, e.g. "Ilnamiki/1.0.0". */
  userAgent: string
  fetch?: typeof globalThis.fetch
  files?: ArtworkFiles
}

/**
 * Downloads a game's image of `kind` at `url` and keeps it as `<folder>/<gameId>/<kind>.<ext>`,
 * giving its path; null when the image isn't there or isn't an image. Throws
 * `MetadataUnavailableError` when it couldn't ask (no network, the server failing), so the game
 * is tried again later.
 */
export type ArtworkDownloader = (
  gameId: string,
  kind: ArtworkKind,
  url: string
) => Promise<string | null>

export function createArtworkDownloader({
  folder,
  userAgent,
  fetch = globalThis.fetch,
  files = diskArtworkFiles
}: ArtworkDownloaderOptions): ArtworkDownloader {
  return async (gameId, kind, url) => {
    let response: Response
    try {
      response = await fetch(url, {
        headers: { 'User-Agent': userAgent },
        signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS)
      })
    } catch (error) {
      throw new MetadataUnavailableError(`Couldn't download ${url}`, { cause: error })
    }
    if (MISSING_STATUSES.has(response.status)) return null
    if (!response.ok) throw new MetadataUnavailableError(`${url} answered ${response.status}`)

    const type = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() ?? ''
    const extension = IMAGE_EXTENSIONS[type]
    if (!extension) return null
    let content: Uint8Array
    try {
      content = new Uint8Array(await response.arrayBuffer())
    } catch (error) {
      throw new MetadataUnavailableError(`Couldn't download ${url}`, { cause: error })
    }
    if (content.length === 0 || content.length > MAX_IMAGE_SIZE) return null

    const path = join(folder, gameId, `${kind}.${extension}`)
    await files.write(path, content)
    return path
  }
}
