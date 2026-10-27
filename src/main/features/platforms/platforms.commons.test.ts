import { describe, expect, it } from 'vitest'

import { parseThumbnailUrl, photoFileName, thumbnailRequestUrl } from './platforms.commons'

const N64_THUMBNAIL =
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/N64-Console-Set.png/1920px-N64-Console-Set.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail'

/** The Commons API's answer for a file that exists, as captured, trimmed to what matters. */
const n64Answer = (thumburl: unknown): unknown => ({
  continue: { iistart: '2021-05-15T23:51:59Z', continue: '||' },
  query: {
    pages: [
      {
        pageid: 12814248,
        ns: 6,
        title: 'File:N64-Console-Set.png',
        imagerepository: 'local',
        imageinfo: [
          {
            thumburl,
            thumbwidth: 1600,
            thumbheight: 861,
            url: 'https://upload.wikimedia.org/wikipedia/commons/0/02/N64-Console-Set.png',
            descriptionurl: 'https://commons.wikimedia.org/wiki/File:N64-Console-Set.png'
          }
        ]
      }
    ]
  }
})

/** The Commons API's answer for a file that doesn't exist, as captured. */
const MISSING_ANSWER = {
  batchcomplete: true,
  query: {
    pages: [{ ns: 6, title: 'File:No-Such-Console-Photo.png', missing: true, imagerepository: '' }]
  }
}

describe('thumbnailRequestUrl', () => {
  it('asks the Commons API for the file at the given width', () => {
    const url = new URL(thumbnailRequestUrl('N64-Console-Set.png', 1600))

    expect(url.origin + url.pathname).toBe('https://commons.wikimedia.org/w/api.php')
    expect(url.searchParams.get('titles')).toBe('File:N64-Console-Set.png')
    expect(url.searchParams.get('iiurlwidth')).toBe('1600')
    expect(url.searchParams.get('formatversion')).toBe('2')
  })
})

describe('parseThumbnailUrl', () => {
  it('gives where the thumbnail of a file is served', () => {
    expect(parseThumbnailUrl(n64Answer(N64_THUMBNAIL))).toBe(N64_THUMBNAIL)
  })

  it('has none for a file Commons doesn’t have', () => {
    expect(parseThumbnailUrl(MISSING_ANSWER)).toBeNull()
  })

  it('refuses a thumbnail served anywhere but Wikimedia’s file hosts, or not over HTTPS', () => {
    expect(parseThumbnailUrl(n64Answer('https://example.com/N64-Console-Set.png'))).toBeNull()
    expect(parseThumbnailUrl(n64Answer(N64_THUMBNAIL.replace('https:', 'http:')))).toBeNull()
    expect(parseThumbnailUrl(n64Answer('not a url'))).toBeNull()
    expect(parseThumbnailUrl(n64Answer(42))).toBeNull()
  })

  it('has none for an answer of another shape', () => {
    expect(parseThumbnailUrl(null)).toBeNull()
    expect(parseThumbnailUrl({ query: { pages: {} } })).toBeNull()
    expect(parseThumbnailUrl({ query: { pages: [] } })).toBeNull()
  })
})

describe('photoFileName', () => {
  it('names the photo by its width and its Commons file name', () => {
    expect(photoFileName('N64-Console-Set.png', 960)).toBe('960px-N64-Console-Set.png')
  })

  it('names the same photo at another width apart', () => {
    expect(photoFileName('N64-Console-Set.png', 1280)).not.toBe(
      photoFileName('N64-Console-Set.png', 960)
    )
  })

  it('replaces anything that could leave the folder or isn’t a plain character', () => {
    expect(photoFileName('../Pokémon mini/system.png', 960)).toBe(
      '960px-.._Pok_mon_mini_system.png'
    )
  })
})
