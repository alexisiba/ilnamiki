/**
 * Width in pixels asked for the photos, one of the standard widths Wikimedia serves as asked
 * (it serves the next standard one for any other). Wider ones lose their transparency for
 * some photos (e.g. the PlayStation's at 1920), so this one is kept for now, sharp for an
 * 800px-wide console on a 1080p screen.
 */
export const PHOTO_WIDTH = 960

/** Hosts Wikimedia serves Commons files and their thumbnails from. */
const FILE_HOSTS = new Set(['thumb.wikimedia.org', 'upload.wikimedia.org'])

/**
 * URL of the Commons API request that answers where the file `commonsFile` is served `width`
 * pixels wide. Commons returns the original when it is narrower.
 */
export function thumbnailRequestUrl(commonsFile: string, width: number): string {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    prop: 'imageinfo',
    iiprop: 'url',
    iiurlwidth: String(width),
    titles: `File:${commonsFile}`
  })
  return `https://commons.wikimedia.org/w/api.php?${params}`
}

/**
 * Where the thumbnail is served, from the Commons API's answer to `thumbnailRequestUrl`.
 * Null when the file is missing or the answer points anywhere but Wikimedia's file host.
 */
export function parseThumbnailUrl(response: unknown): string | null {
  const pages = (response as { query?: { pages?: unknown } } | null)?.query?.pages
  if (!Array.isArray(pages)) return null
  const thumbUrl = pages[0]?.imageinfo?.[0]?.thumburl
  if (typeof thumbUrl !== 'string') return null
  try {
    const url = new URL(thumbUrl)
    return url.protocol === 'https:' && FILE_HOSTS.has(url.hostname) ? url.href : null
  } catch {
    return null
  }
}

/**
 * Name of the file a photo `width` pixels wide is kept in: the width and its Commons name with
 * only safe characters, so a photo or width that changes in a new release is downloaded again.
 */
export function photoFileName(commonsFile: string, width: number): string {
  return `${width}px-${commonsFile.replace(/[^\w.-]/g, '_')}`
}
