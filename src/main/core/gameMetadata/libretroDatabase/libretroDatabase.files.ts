import { createReadStream } from 'fs'
import { open, readFile, stat } from 'fs/promises'

/** How the provider reads files, its databases and the games'. Tests pass one in memory. */
export interface FileReader {
  /** The whole file. */
  read(path: string): Promise<Uint8Array>
  /** Its size in bytes. */
  size(path: string): Promise<number>
  /** Its first `length` bytes, fewer when it is shorter. */
  readStart(path: string, length: number): Promise<Uint8Array>
  /** `length` bytes from `offset`, fewer when the file ends before. */
  readAt(path: string, offset: number, length: number): Promise<Uint8Array>
  /** Its content in chunks, read as they are asked for, so a large file never fills memory. */
  chunks(path: string): AsyncIterable<Uint8Array>
}

/** Reads the files on disk. */
export const diskReader: FileReader = {
  read: (path) => readFile(path),

  size: async (path) => (await stat(path)).size,

  readStart: (path, length) => diskReader.readAt(path, 0, length),

  async readAt(path, offset, length) {
    const handle = await open(path, 'r')
    try {
      const buffer = Buffer.alloc(length)
      const { bytesRead } = await handle.read(buffer, 0, length, offset)
      return buffer.subarray(0, bytesRead)
    } finally {
      await handle.close()
    }
  },

  chunks: (path) => createReadStream(path)
}
