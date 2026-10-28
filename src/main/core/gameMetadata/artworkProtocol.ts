import { net, protocol } from 'electron'
import { relative, isAbsolute } from 'path'
import { pathToFileURL } from 'url'

import { getDatabase } from '../database'
import { ARTWORK_SCHEME, parseArtworkUrl } from './artworkUrls'
import { artworkFolder } from './gameMetadata'
import { createGameMetadataRepository } from './gameMetadata.repository'

/** Whether `path` is inside `folder`. */
const isInside = (path: string, folder: string): boolean => {
  const inside = relative(folder, path)
  return inside.length > 0 && !inside.startsWith('..') && !isAbsolute(inside)
}

/**
 * Lets the renderer load games' images by URL, like any web image (cached, lazy). Called
 * before the app is ready, as Electron requires for a scheme's privileges.
 */
export function registerArtworkScheme(): void {
  protocol.registerSchemesAsPrivileged([
    { scheme: ARTWORK_SCHEME, privileges: { standard: true, secure: true } }
  ])
}

/**
 * Serves each image URL from the file the database keeps for that game and kind. The renderer
 * names only a game and a kind, never a path, and only files in the artwork folder are served.
 */
export function serveArtwork(): void {
  protocol.handle(ARTWORK_SCHEME, async (request) => {
    const image = parseArtworkUrl(request.url)
    const path =
      image && createGameMetadataRepository(getDatabase()).findImagePath(image.gameId, image.kind)
    if (!path || !isInside(path, artworkFolder())) return new Response(null, { status: 404 })
    return net.fetch(pathToFileURL(path).toString())
  })
}
