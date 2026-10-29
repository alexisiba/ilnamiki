/** What an `.rdb` file starts with, before the offset of its index. */
const RDB_MAGIC = 'RARCHDB\0'

/** Bytes before the first record: the magic and the 8-byte offset of the index. */
const RDB_HEADER_SIZE = 16

/** A value of a record: text, a number, or bytes written as lowercase hex (checksums). */
export type RdbValue = string | number | null

/** One game of a libretro database, e.g. `{ name: "Super Mario 64 (USA)", crc: "3ce60709" }`. */
export type RdbRecord = Record<string, RdbValue>

/**
 * The records of a libretro database (`.rdb`): msgpack maps one after another after its
 * header, until a nil. Only the msgpack types the databases use are read; anything else, or a
 * file that isn't a database, throws. Checked against every database of RetroArch 1.22.2 (146
 * files, about 740,000 records) on 2026-10-27.
 */
export function parseRdb(data: Uint8Array): RdbRecord[] {
  const buffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength)
  if (buffer.toString('latin1', 0, RDB_MAGIC.length) !== RDB_MAGIC) {
    throw new Error('Not a libretro database')
  }
  let position = RDB_HEADER_SIZE

  const text = (length: number): string => {
    const value = buffer.toString('utf8', position, position + length)
    position += length
    return value
  }
  const bytes = (length: number): string => {
    const value = buffer.toString('hex', position, position + length)
    position += length
    return value
  }
  const unsigned = (size: 1 | 2 | 4): number => {
    const value = buffer.readUIntBE(position, size)
    position += size
    return value
  }

  const value = (): RdbValue | RdbRecord => {
    const type = buffer[position++]
    if (type <= 0x7f) return type
    if ((type & 0xf0) === 0x80) return map(type & 0x0f)
    if ((type & 0xe0) === 0xa0) return text(type & 0x1f)
    switch (type) {
      case 0xc0:
        return null
      case 0xc4:
        return bytes(unsigned(1))
      case 0xc5:
        return bytes(unsigned(2))
      case 0xc6:
        return bytes(unsigned(4))
      case 0xcc:
        return unsigned(1)
      case 0xcd:
        return unsigned(2)
      case 0xce:
        return unsigned(4)
      case 0xcf: {
        const number = Number(buffer.readBigUInt64BE(position))
        position += 8
        return number
      }
      case 0xd9:
        return text(unsigned(1))
      case 0xda:
        return text(unsigned(2))
      case 0xdb:
        return text(unsigned(4))
      case 0xde:
        return map(unsigned(2))
      default:
        throw new Error(`Unexpected msgpack type 0x${type.toString(16)} at ${position - 1}`)
    }
  }

  const map = (size: number): RdbRecord => {
    const record: RdbRecord = {}
    for (let index = 0; index < size; index++) {
      const key = value()
      const item = value()
      if (typeof key === 'string' && (item === null || typeof item !== 'object')) {
        record[key] = item
      }
    }
    return record
  }

  const records: RdbRecord[] = []
  while (position < buffer.length) {
    const record = value()
    if (record === null) break
    if (typeof record === 'object') records.push(record)
  }
  return records
}

/**
 * Extensions of archives: emulators that declare them play the archive as it is (arcade sets),
 * and the databases know those by the archive's name, not by a checksum.
 */
export const ARCHIVE_EXTENSIONS = ['.zip', '.7z']

/** A CRC32 as the databases write it: 8 lowercase hex digits. */
export const formatCrc = (crc: number): string => crc.toString(16).padStart(8, '0')

/** Size of a SNES copier header. */
const SNES_COPIER_HEADER_SIZE = 512

/** Size of an iNES header. */
const INES_HEADER_SIZE = 16

/** What an iNES file starts with: "NES" and an end-of-file character. */
const INES_MAGIC = [0x4e, 0x45, 0x53, 0x1a]

/**
 * Where a file of `size` bytes, starting with `start`, may begin once headers the databases
 * don't count are skipped: 0 for the whole file, and the size of any copier or emulator header
 * it seems to have (a SNES copier header makes a size 512 over a multiple of 1024; an iNES
 * header starts with "NES"). Checksums from each are tried; a wrong one simply matches nothing.
 */
export function contentStartsOf(size: number, start: Uint8Array): number[] {
  const starts = [0]
  if (size > SNES_COPIER_HEADER_SIZE && size % 1024 === SNES_COPIER_HEADER_SIZE) {
    starts.push(SNES_COPIER_HEADER_SIZE)
  }
  if (size > INES_HEADER_SIZE && INES_MAGIC.every((byte, index) => start[index] === byte)) {
    starts.push(INES_HEADER_SIZE)
  }
  return starts
}

/**
 * Articles the databases move to the end of a title ("Legend of Zelda, The"), as they are
 * written there. "L'" joins the next word without a space.
 */
const MOVED_ARTICLES = [
  'The',
  'A',
  'An',
  'Le',
  'La',
  'Les',
  "L'",
  'Der',
  'Die',
  'Das',
  'El',
  'Los',
  'Las',
  'Il'
]

const MOVED_ARTICLE_PATTERN = new RegExp(`^(.+), (${MOVED_ARTICLES.join('|')})$`)

/** A part of a title with its article back in front, e.g. "Legend of Zelda, The" → "The Legend of Zelda". */
function moveArticleBack(part: string): string {
  const match = MOVED_ARTICLE_PATTERN.exec(part)
  if (!match) return part
  const [, rest, article] = match
  return article.endsWith("'") ? `${article}${rest}` : `${article} ${rest}`
}

/**
 * A database's name of a game made readable: tags in `()` and `[]` (region, languages,
 * revision) dropped, and articles moved to the end put back in front of each part, e.g.
 * "Legend of Zelda, The - Link's Awakening (USA, Europe) (Rev 2)" →
 * "The Legend of Zelda - Link's Awakening". Null when nothing is left.
 */
export function readableTitle(name: string): string | null {
  const title = name
    .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' - ')
    .map(moveArticleBack)
    .join(' - ')
  return title.length > 0 ? title : null
}

/**
 * The file a cue sheet (`.cue`) names first, as written, e.g. "Crash Bandicoot.bin" for
 * `FILE "Crash Bandicoot.bin" BINARY`: the disc's first track, where its data is. Null when it
 * names none.
 */
export function cueFirstFile(cue: string): string | null {
  const match = /^\s*FILE\s+(?:"([^"]+)"|(\S+))/im.exec(cue)
  return match ? (match[1] ?? match[2]) : null
}

/** Bytes of data in a sector of an ISO 9660 file system. */
export const ISO_SECTOR_SIZE = 2048

/** How a disc image keeps its sectors: their size, and where their data starts in each. */
export interface SectorLayout {
  size: number
  dataOffset: number
}

/** What a raw CD sector starts with: 00, ten FF, 00. */
const RAW_SECTOR_SYNC = [0x00, ...Array<number>(10).fill(0xff), 0x00]

/** Size of a raw CD sector, as `.bin` images keep them (MODE1/2352, MODE2/2352). */
const RAW_SECTOR_SIZE = 2352

/** Byte of a raw sector's header that tells its mode. */
const RAW_SECTOR_MODE = 15

/**
 * How the disc image starting with `start` (its first 16 bytes or more) keeps its sectors: raw
 * sectors of 2352 bytes when it starts with their sync, the data after the 16-byte header in
 * mode 1 and after its 8-byte subheader too in mode 2 (PlayStation discs); else sectors of
 * data only (`.iso`).
 */
export function sectorLayoutOf(start: Uint8Array): SectorLayout {
  if (!RAW_SECTOR_SYNC.every((byte, index) => start[index] === byte)) {
    return { size: ISO_SECTOR_SIZE, dataOffset: 0 }
  }
  return { size: RAW_SECTOR_SIZE, dataOffset: start[RAW_SECTOR_MODE] === 2 ? 24 : 16 }
}

/** Sector of an ISO 9660 file system where its primary volume descriptor is. */
export const PRIMARY_VOLUME_DESCRIPTOR_SECTOR = 16

/** Where an ISO 9660 file or directory is: its first sector and its size in bytes. */
export interface IsoExtent {
  sector: number
  size: number
}

/** Where the directory record at `offset` of `data` says its file is. */
const extentAt = (data: Uint8Array, offset: number): IsoExtent => {
  const view = Buffer.from(data.buffer, data.byteOffset, data.byteLength)
  return { sector: view.readUInt32LE(offset + 2), size: view.readUInt32LE(offset + 10) }
}

/**
 * Where the root directory is, from an ISO 9660 primary volume descriptor (the data of sector
 * 16). Null when `descriptor` isn't one.
 */
export function rootDirectoryOf(descriptor: Uint8Array): IsoExtent | null {
  if (descriptor.length < 190) return null
  const magic = Buffer.from(descriptor.subarray(1, 6)).toString('latin1')
  if (descriptor[0] !== 1 || magic !== 'CD001') return null
  // The root directory's record is at byte 156 of the descriptor.
  return extentAt(descriptor, 156)
}

/**
 * Where the file named `name` (any case, e.g. "SYSTEM.CNF") is in `directory`, the data of an
 * ISO 9660 directory's sectors one after another. Records never cross a sector: a zero length
 * means the rest of that sector is empty. Null when the directory doesn't have it.
 */
export function findInDirectory(directory: Uint8Array, name: string): IsoExtent | null {
  const wanted = name.toUpperCase()
  let offset = 0
  while (offset < directory.length) {
    const length = directory[offset]
    if (length === 0) {
      offset = (Math.floor(offset / ISO_SECTOR_SIZE) + 1) * ISO_SECTOR_SIZE
      continue
    }
    if (offset + length > directory.length || length < 34) return null
    const nameLength = directory[offset + 32]
    const recordName = Buffer.from(directory.subarray(offset + 33, offset + 33 + nameLength))
      .toString('latin1')
      .toUpperCase()
      .replace(/;\d+$/, '')
    if (recordName === wanted) return extentAt(directory, offset)
    offset += length
  }
  return null
}

/** A disc's serial as the databases write it: four letters, a dash and five digits. */
const SERIAL_PATTERN = /^[A-Z]{4}-\d{5}$/

/**
 * The serial a PlayStation or PlayStation 2 disc says in its `SYSTEM.CNF`: the name of the
 * program it boots (`BOOT2 = cdrom0:\SLUS_205.25;1` on PlayStation 2, `BOOT = cdrom:\SCUS_949.00;1`
 * on PlayStation) as the databases write serials, e.g. "SLUS-20525". Null when it boots a
 * program not named after a serial (e.g. "PSX.EXE"). Checked on 2026-10-28, with the disc reader,
 * against four PlayStation discs (`.cue` and `.bin`, MODE2/2352) and a PlayStation 2 `.iso`.
 */
export function systemCnfSerial(systemCnf: string): string | null {
  const boot =
    /^\s*BOOT2\s*=\s*(.+)$/im.exec(systemCnf)?.[1] ?? /^\s*BOOT\s*=\s*(.+)$/im.exec(systemCnf)?.[1]
  if (!boot) return null
  const program = boot
    .trim()
    .replace(/;\d+$/, '')
    .split(/[:\\/]/)
    .pop()
  const serial = program?.toUpperCase().replace('_', '-').replace('.', '')
  return serial && SERIAL_PATTERN.test(serial) ? serial : null
}
