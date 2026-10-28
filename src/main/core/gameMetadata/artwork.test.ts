import { describe, expect, it, vi } from 'vitest'

import { type ArtworkFiles, createArtworkDownloader } from './artwork'
import { MetadataUnavailableError } from './gameMetadata.types'

const URL = 'https://thumbnails.libretro.com/Nintendo%20-%20Game%20Boy/Named_Boxarts/Tetris.png'
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47])

/** A downloader whose server answers with `response`, writing files in `written`. */
function downloader(response: Response | Error): {
  download: ReturnType<typeof createArtworkDownloader>
  fetch: ReturnType<typeof vi.fn>
  written: Map<string, Uint8Array>
} {
  const written = new Map<string, Uint8Array>()
  const files: ArtworkFiles = { write: async (path, content) => void written.set(path, content) }
  const fetch = vi.fn(async () => {
    if (response instanceof Error) throw response
    return response
  })
  const download = createArtworkDownloader({
    folder: '/data/artwork',
    userAgent: 'Ilnamiki/1.0.0',
    fetch,
    files
  })
  return { download, fetch, written }
}

const image = (content: Uint8Array<ArrayBuffer>, type: string, status = 200): Response =>
  new Response(content, { status, headers: { 'content-type': type } })

describe('createArtworkDownloader', () => {
  it('keeps an image as the game’s file of its kind, with its type’s extension', async () => {
    const { download, written } = downloader(image(PNG, 'image/png'))

    expect(await download('g1', 'cover', URL)).toBe('/data/artwork/g1/cover.png')
    expect(written.get('/data/artwork/g1/cover.png')).toEqual(PNG)
  })

  it('names Ilnamiki to the server', async () => {
    const { download, fetch } = downloader(image(PNG, 'image/jpeg; charset=binary'))

    expect(await download('g1', 'title-screen', URL)).toBe('/data/artwork/g1/title-screen.jpg')
    expect(fetch).toHaveBeenCalledWith(
      URL,
      expect.objectContaining({ headers: { 'User-Agent': 'Ilnamiki/1.0.0' } })
    )
  })

  it('gives no image when the server doesn’t have it, or sends something else', async () => {
    expect(await downloader(image(PNG, 'text/html', 404)).download('g1', 'cover', URL)).toBeNull()
    expect(await downloader(image(PNG, 'text/html')).download('g1', 'cover', URL)).toBeNull()
    expect(
      await downloader(image(new Uint8Array(0), 'image/png')).download('g1', 'cover', URL)
    ).toBeNull()
  })

  it('can’t ask without network or while the server fails, so the game is tried again', async () => {
    await expect(
      downloader(new TypeError('fetch failed')).download('g1', 'cover', URL)
    ).rejects.toThrow(MetadataUnavailableError)
    await expect(
      downloader(image(PNG, 'text/html', 503)).download('g1', 'cover', URL)
    ).rejects.toThrow(MetadataUnavailableError)
  })

  it('writes nothing when there is no image', async () => {
    const { download, written } = downloader(image(PNG, 'text/html', 404))
    await download('g1', 'cover', URL)

    expect(written.size).toBe(0)
  })
})
