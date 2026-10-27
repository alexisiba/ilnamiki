import { app } from 'electron'
import { mkdir, readFile, rename, writeFile } from 'fs/promises'
import { join } from 'path'

import type { EmulatorChoice } from '@shared/api'

import { getDatabase } from '../../core/database'
import { isAmongEmulators, listInstalledPlatforms } from '../../core/installedPlatforms'
import { createPlatformSettingsRepository } from '../../core/platformSettings'
import {
  parseThumbnailUrl,
  PHOTO_WIDTH,
  photoFileName,
  thumbnailRequestUrl
} from './platforms.commons'
import { PLATFORM_PHOTOS } from './platforms.photos'

/** How long a request to Wikimedia may take before it is given up. */
const DOWNLOAD_TIMEOUT_MS = 30_000

/** Folder of the downloaded console photos, inside the app's data folder. */
const photosFolder = (): string => join(app.getPath('userData'), 'platforms', 'photos')

/** Wikimedia asks every client to name itself and how to reach its maintainers. */
const userAgent = (): string =>
  `Ilnamiki/${app.getVersion()} (https://github.com/alexisiba/ilnamiki)`

/** Downloads in progress, by file name, so a photo asked for twice is downloaded once. */
const downloads = new Map<string, Promise<Buffer>>()

async function fetchFromWikimedia(url: string): Promise<Response> {
  const response = await fetch(url, {
    headers: { 'User-Agent': userAgent() },
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS)
  })
  if (!response.ok) throw new Error(`Wikimedia answered ${response.status} for ${url}`)
  return response
}

/** Downloads the photo `commonsFile` and keeps it at `path`; its bytes. */
async function downloadPhoto(commonsFile: string, path: string): Promise<Buffer> {
  const answer = await fetchFromWikimedia(thumbnailRequestUrl(commonsFile, PHOTO_WIDTH))
  const thumbUrl = parseThumbnailUrl(await answer.json())
  if (!thumbUrl) throw new Error(`Commons has no thumbnail of ${commonsFile}`)
  const image = await fetchFromWikimedia(thumbUrl)
  if (image.headers.get('content-type') !== 'image/png') {
    throw new Error(`The thumbnail of ${commonsFile} isn't a PNG`)
  }
  const data = Buffer.from(await image.arrayBuffer())
  await mkdir(photosFolder(), { recursive: true })
  // Written aside and moved in place, so an interrupted download never leaves half a photo.
  const partial = `${path}.part`
  await writeFile(partial, data)
  await rename(partial, path)
  return data
}

/** What the user sets for the installed platforms, and the photos of their consoles. */
export const platformsService = {
  /**
   * Keeps `emulator` as the one the games of the platform `platformId` play with, or forgets
   * it with null. Throws when `emulator` isn't one of the platform's emulators.
   */
  async setDefaultEmulator(platformId: string, emulator: EmulatorChoice | null): Promise<void> {
    if (emulator) {
      const platform = (await listInstalledPlatforms()).find(({ id }) => id === platformId)
      if (!platform || !isAmongEmulators(emulator, platform.emulators)) {
        throw new Error(`The emulator ${emulator.emulatorId} doesn't play ${platformId}`)
      }
    }
    createPlatformSettingsRepository(getDatabase()).setDefaultEmulator(
      platformId,
      emulator,
      Date.now()
    )
  },

  /**
   * The photo of the console of `platformId` as a `data:` URL: the one kept, or else
   * downloaded and kept. Null when the app has none for it or it can't be downloaded now.
   */
  async getPhoto(platformId: string): Promise<string | null> {
    const photo = PLATFORM_PHOTOS[platformId]
    if (!photo) return null
    const fileName = photoFileName(photo.commonsFile, PHOTO_WIDTH)
    const path = join(photosFolder(), fileName)
    try {
      return toPngDataUrl(await readFile(path))
    } catch {
      // Not downloaded yet.
    }

    let download = downloads.get(fileName)
    if (!download) {
      download = downloadPhoto(photo.commonsFile, path).finally(() => downloads.delete(fileName))
      downloads.set(fileName, download)
    }
    try {
      return toPngDataUrl(await download)
    } catch (error) {
      console.warn(`Could not download the photo of ${platformId}:`, error)
      return null
    }
  }
}

const toPngDataUrl = (data: Buffer): string => `data:image/png;base64,${data.toString('base64')}`
