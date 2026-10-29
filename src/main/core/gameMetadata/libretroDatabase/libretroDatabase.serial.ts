import { dirname, extname, join } from 'path'

import type { FileReader } from './libretroDatabase.files'
import {
  cueFirstFile,
  findInDirectory,
  ISO_SECTOR_SIZE,
  type IsoExtent,
  PRIMARY_VOLUME_DESCRIPTOR_SECTOR,
  rootDirectoryOf,
  sectorLayoutOf,
  systemCnfSerial
} from './libretroDatabase.parsers'

/** Largest cue sheet read: real ones are a few hundred bytes. */
const MAX_CUE_SIZE = 64 * 1024

/** Most sectors of a directory read looking for a file: the root of a game disc is far smaller. */
const MAX_DIRECTORY_SECTORS = 16

/** Extensions of disc images whose sectors are read as they are. */
const DISC_IMAGE_EXTENSIONS = ['.iso', '.bin', '.img']

/**
 * The disc image to read for the game at `path`: the file a cue sheet names first (its first
 * track, relative to the sheet), or the file itself when it is a disc image. Null for any other
 * file.
 */
async function discImageOf(path: string, reader: FileReader): Promise<string | null> {
  const extension = extname(path).toLowerCase()
  if (DISC_IMAGE_EXTENSIONS.includes(extension)) return path
  if (extension !== '.cue') return null
  const file = cueFirstFile(Buffer.from(await reader.readStart(path, MAX_CUE_SIZE)).toString())
  return file && join(dirname(path), file)
}

/**
 * The file `name` in the root directory of the ISO 9660 disc image at `path`, read with
 * `reader` sector by sector, whatever size its sectors are. Null when the image has no such file
 * system or no such file.
 */
async function readRootFile(
  path: string,
  name: string,
  reader: FileReader
): Promise<Uint8Array | null> {
  const layout = sectorLayoutOf(await reader.readStart(path, 16))
  const readExtent = async ({ sector, size }: IsoExtent, maxSectors: number): Promise<Buffer> => {
    const count = Math.min(Math.ceil(size / ISO_SECTOR_SIZE), maxSectors)
    const sectors: Uint8Array[] = []
    for (let index = 0; index < count; index++) {
      const offset = (sector + index) * layout.size + layout.dataOffset
      sectors.push(await reader.readAt(path, offset, ISO_SECTOR_SIZE))
    }
    return Buffer.concat(sectors).subarray(0, size)
  }

  const root = rootDirectoryOf(
    await readExtent({ sector: PRIMARY_VOLUME_DESCRIPTOR_SECTOR, size: ISO_SECTOR_SIZE }, 1)
  )
  if (!root) return null
  const file = findInDirectory(await readExtent(root, MAX_DIRECTORY_SECTORS), name)
  return file && readExtent(file, 1)
}

/** The serial of a PlayStation or PlayStation 2 game at `path`, from its disc's SYSTEM.CNF. */
async function systemCnfSerialOf(path: string, reader: FileReader): Promise<string | null> {
  const image = await discImageOf(path, reader)
  const systemCnf = image && (await readRootFile(image, 'SYSTEM.CNF', reader))
  return systemCnf && systemCnfSerial(Buffer.from(systemCnf).toString('latin1'))
}

/** How each platform whose discs say their serial has it read. */
const SERIAL_READERS: Partial<
  Record<string, (path: string, reader: FileReader) => Promise<string | null>>
> = {
  playstation: systemCnfSerialOf,
  playstation2: systemCnfSerialOf
}

/**
 * The serial of the game at `path` on `platformId` (e.g. "SCUS-94900"), as the databases
 * write it, read with `reader` from a few KB of its disc. Null for a platform whose serial isn't
 * read, or a file that doesn't say one or can't be read.
 */
export async function serialOf(
  platformId: string,
  path: string,
  reader: FileReader
): Promise<string | null> {
  const read = SERIAL_READERS[platformId]
  if (!read) return null
  try {
    return await read(path, reader)
  } catch {
    return null
  }
}
