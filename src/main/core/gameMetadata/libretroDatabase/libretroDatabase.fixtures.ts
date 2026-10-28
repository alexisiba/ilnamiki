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
    async *chunks(path) {
      const content = contentOf(path)
      for (let start = 0; start < content.length; start += chunkSize) {
        yield content.subarray(start, start + chunkSize)
      }
    }
  }
}
