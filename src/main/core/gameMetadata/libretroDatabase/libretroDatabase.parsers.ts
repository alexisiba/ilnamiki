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
