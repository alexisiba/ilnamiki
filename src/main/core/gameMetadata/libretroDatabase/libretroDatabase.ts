import { basename } from 'path'

import {
  type ContentProvider,
  type Identifier,
  MetadataUnavailableError
} from '../gameMetadata.types'
import { checksumsOf } from './libretroDatabase.checksums'
import { diskReader, type FileReader } from './libretroDatabase.files'
import { type DatabaseIndex, findGame, indexRecords } from './libretroDatabase.index'
import { parseRdb } from './libretroDatabase.parsers'
import { serialOf } from './libretroDatabase.serial'

/** A libretro database file (`.rdb`) on this computer, and the platform whose games it lists. */
export interface LibretroDatabaseFile {
  /** e.g. "nintendo_64". */
  platformId: string
  /** e.g. "Nintendo - Nintendo 64". */
  name: string
  /** Absolute path of the file. */
  path: string
}

/** The games of the database at `path`; null when it can't be read or isn't a database. */
async function loadIndex(path: string, reader: FileReader): Promise<DatabaseIndex | null> {
  try {
    return indexRecords(parseRdb(await reader.read(path)))
  } catch (error) {
    console.error(`Couldn't read the libretro database ${path}`, error)
    return null
  }
}

/**
 * The libretro databases RetroArch keeps (`.rdb`), read offline: they tell which game a file
 * is, by its CRC, its disc's serial or its exact name, and its details. `listDatabases` says which files there
 * are; each is read once, when first needed, and kept while this provider lives, so one is
 * made for each run over the library rather than kept for the app's life. Files are read with
 * `reader`, the disk's unless another is given.
 */
export function createLibretroDatabase(
  listDatabases: () => Promise<LibretroDatabaseFile[]>,
  reader: FileReader = diskReader
): Identifier & Required<Pick<ContentProvider, 'details'>> {
  let files: Promise<LibretroDatabaseFile[]> | null = null
  const indexes = new Map<string, Promise<DatabaseIndex | null>>()

  const filesOf = async (
    match: (file: LibretroDatabaseFile) => boolean
  ): Promise<LibretroDatabaseFile[]> => {
    files ??= listDatabases()
    return (await files).filter(match)
  }
  const indexOf = (path: string): Promise<DatabaseIndex | null> => {
    let index = indexes.get(path)
    if (!index) {
      index = loadIndex(path, reader)
      indexes.set(path, index)
    }
    return index
  }

  return {
    id: 'libretro-database',

    async identify({ platformId, filePath }) {
      const loaded = await Promise.all(
        (await filesOf((file) => file.platformId === platformId)).map(async ({ name, path }) => ({
          name,
          index: await indexOf(path)
        }))
      )
      const databases = loaded.flatMap(({ name, index }) => (index ? [{ name, index }] : []))
      // Without a database it could read there was nothing to look in, which isn't knowing the
      // game: it is tried again once RetroArch has the platform's databases.
      if (databases.length === 0) {
        throw new MetadataUnavailableError(`No libretro database for ${platformId}`)
      }
      // The serial is read for every disc, not only when no CRC matches: it is a few KB, and
      // findGame still takes the CRC first.
      const game = findGame(databases, {
        crcs: await checksumsOf(filePath, reader),
        serial: await serialOf(platformId, filePath, reader),
        fileName: basename(filePath)
      })
      return game && { providerId: 'libretro-database', ...game }
    },

    async details({ database, name }) {
      const [file] = await filesOf((candidate) => candidate.name === database)
      if (!file) return null
      return (await indexOf(file.path))?.details.get(name) ?? null
    }
  }
}
