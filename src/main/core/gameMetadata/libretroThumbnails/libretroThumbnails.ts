import type { ArtworkKind, ArtworkUrl, ContentProvider } from '../gameMetadata.types'

/** libretro's thumbnails server: one folder per database, images named after its games. */
const SERVER = 'https://thumbnails.libretro.com'

/** The server's folder of each artwork kind. */
const KIND_FOLDERS: Record<ArtworkKind, string> = {
  cover: 'Named_Boxarts',
  'title-screen': 'Named_Titles',
  screenshot: 'Named_Snaps'
}

/** Characters libretro replaces with "_" in an image's name, as file systems refuse them. */
const REPLACED_CHARACTERS = /[&*/:`<>?\\|"]/g

/**
 * The URLs of a game's images on libretro's thumbnails server, from its name in the libretro
 * database `database`, e.g. ".../Nintendo - Game Boy/Named_Boxarts/Tetris (World) (Rev 1).png".
 */
export function thumbnailUrls(database: string, name: string): ArtworkUrl[] {
  const fileName = `${name.replace(REPLACED_CHARACTERS, '_')}.png`
  return Object.entries(KIND_FOLDERS).map(([kind, folder]) => ({
    kind: kind as ArtworkKind,
    url: `${SERVER}/${[database, folder, fileName].map(encodeURIComponent).join('/')}`
  }))
}

/**
 * libretro's thumbnails: a cover, a title screen and a screenshot of most games the libretro
 * databases list, no key needed. It knows only games identified by `libretro-database`, whose
 * names its images use; which images exist is only known when they are downloaded.
 */
export const libretroThumbnails: ContentProvider = {
  id: 'libretro-thumbnails',

  async artwork({ providerId, database, name }) {
    return providerId === 'libretro-database' ? thumbnailUrls(database, name) : []
  }
}
