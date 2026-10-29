import type { FileReader } from './libretroDatabase.files'

/** A value of a record to write: text, a whole number, or bytes (checksums, serials). */
type RecordValue = string | number | Uint8Array

/** `length` as a big-endian unsigned number of `size` bytes. */
const unsigned = (length: number, size: 1 | 2 | 4): Buffer => {
  const buffer = Buffer.alloc(size)
  buffer.writeUIntBE(length, 0, size)
  return buffer
}

function encodeValue(value: RecordValue): Buffer {
  if (typeof value === 'string') {
    const text = Buffer.from(value, 'utf8')
    const length = text.length
    if (length < 32) return Buffer.concat([Buffer.from([0xa0 | length]), text])
    if (length < 0x100) return Buffer.concat([Buffer.from([0xd9]), unsigned(length, 1), text])
    if (length < 0x10000) return Buffer.concat([Buffer.from([0xda]), unsigned(length, 2), text])
    return Buffer.concat([Buffer.from([0xdb]), unsigned(length, 4), text])
  }
  if (typeof value === 'number') {
    if (value < 0x80) return Buffer.from([value])
    if (value < 0x100) return Buffer.concat([Buffer.from([0xcc]), unsigned(value, 1)])
    if (value < 0x10000) return Buffer.concat([Buffer.from([0xcd]), unsigned(value, 2)])
    if (value < 0x100000000) return Buffer.concat([Buffer.from([0xce]), unsigned(value, 4)])
    const big = Buffer.alloc(8)
    big.writeBigUInt64BE(BigInt(value))
    return Buffer.concat([Buffer.from([0xcf]), big])
  }
  const bytes = Buffer.from(value)
  if (bytes.length < 0x100)
    return Buffer.concat([Buffer.from([0xc4]), unsigned(bytes.length, 1), bytes])
  return Buffer.concat([Buffer.from([0xc5]), unsigned(bytes.length, 2), bytes])
}

/**
 * A libretro database (`.rdb`) with `records`, written as RetroArch writes them: a header,
 * one msgpack map per record and a nil. Checksums go as bytes (`Buffer.from('…', 'hex')`).
 */
export function encodeRdb(records: Record<string, RecordValue>[]): Buffer {
  const header = Buffer.concat([Buffer.from('RARCHDB\0', 'latin1'), Buffer.alloc(8)])
  const maps = records.map((record) => {
    const entries = Object.entries(record)
    const size =
      entries.length < 16
        ? Buffer.from([0x80 | entries.length])
        : Buffer.concat([Buffer.from([0xde]), unsigned(entries.length, 2)])
    return Buffer.concat([
      size,
      ...entries.flatMap(([key, value]) => [encodeValue(key), encodeValue(value)])
    ])
  })
  return Buffer.concat([header, ...maps, Buffer.from([0xc0])])
}

/**
 * A reader of `files` kept in memory, by path, that hands their content in chunks of
 * `chunkSize` bytes. A path it doesn't have fails as a missing file would.
 */
export function memoryReader(files: Record<string, Uint8Array>, chunkSize = 1024): FileReader {
  const contentOf = (path: string): Uint8Array => {
    const content = files[path]
    if (!content) throw Object.assign(new Error(`ENOENT: ${path}`), { code: 'ENOENT' })
    return content
  }
  return {
    read: async (path) => contentOf(path),
    size: async (path) => contentOf(path).length,
    readStart: async (path, length) => contentOf(path).subarray(0, length),
    readAt: async (path, offset, length) => contentOf(path).subarray(offset, offset + length),
    async *chunks(path) {
      const content = contentOf(path)
      for (let start = 0; start < content.length; start += chunkSize) {
        yield content.subarray(start, start + chunkSize)
      }
    }
  }
}

/** Data bytes in a sector of an ISO 9660 file system. */
const SECTOR_DATA_SIZE = 2048

/** Sector of the fake disc's root directory, after its primary volume descriptor (16). */
const ROOT_SECTOR = 18

/** An ISO 9660 directory record for a file of `size` bytes at `sector`, named `name`. */
function directoryRecord(name: Buffer, sector: number, size: number, isDirectory: boolean): Buffer {
  const record = Buffer.alloc(33 + name.length + (name.length % 2 === 0 ? 1 : 0))
  record[0] = record.length
  record.writeUInt32LE(sector, 2)
  record.writeUInt32BE(sector, 6)
  record.writeUInt32LE(size, 10)
  record.writeUInt32BE(size, 14)
  record[25] = isDirectory ? 2 : 0
  record[32] = name.length
  name.copy(record, 33)
  return record
}

/** A sector's 2048 bytes of data as a raw CD sector of 2352 bytes in `mode`. */
function rawSector(data: Buffer, mode: 1 | 2): Buffer {
  const sector = Buffer.alloc(2352)
  sector[0] = 0x00
  sector.fill(0xff, 1, 11)
  sector[11] = 0x00
  sector[15] = mode
  data.copy(sector, mode === 2 ? 24 : 16)
  return sector
}

/**
 * A disc image with an ISO 9660 file system whose root directory has `files` (by name, e.g.
 * "SYSTEM.CNF", each up to one sector of text), as `.iso` images keep sectors (`iso`, 2048
 * bytes) or as `.bin` images do (`mode1`, `mode2`: raw sectors of 2352 bytes). Without a root
 * directory when `files` is null: a disc of data that isn't a file system.
 */
export function encodeDisc(
  files: Record<string, string> | null,
  sectors: 'iso' | 'mode1' | 'mode2' = 'iso'
): Buffer {
  const data = Array.from({ length: ROOT_SECTOR + 1 }, () => Buffer.alloc(SECTOR_DATA_SIZE))
  if (files) {
    const descriptor = data[16]
    descriptor[0] = 1
    descriptor.write('CD001', 1, 'latin1')
    descriptor[6] = 1
    directoryRecord(Buffer.from([0]), ROOT_SECTOR, SECTOR_DATA_SIZE, true).copy(descriptor, 156)

    const records = [
      directoryRecord(Buffer.from([0]), ROOT_SECTOR, SECTOR_DATA_SIZE, true),
      directoryRecord(Buffer.from([1]), ROOT_SECTOR, SECTOR_DATA_SIZE, true)
    ]
    for (const [name, content] of Object.entries(files)) {
      const sector = data.length
      const bytes = Buffer.from(content, 'latin1')
      data.push(Buffer.concat([bytes, Buffer.alloc(SECTOR_DATA_SIZE - bytes.length)]))
      records.push(directoryRecord(Buffer.from(`${name};1`, 'latin1'), sector, bytes.length, false))
    }
    Buffer.concat(records).copy(data[ROOT_SECTOR])
  }
  if (sectors === 'iso') return Buffer.concat(data)
  return Buffer.concat(data.map((sector) => rawSector(sector, sectors === 'mode1' ? 1 : 2)))
}
