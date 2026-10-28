import { crc32 } from 'zlib'
import { describe, expect, it } from 'vitest'

import { checksumsOf, crcsOf } from './libretroDatabase.checksums'
import { memoryReader } from './libretroDatabase.fixtures'
import { formatCrc } from './libretroDatabase.parsers'

const crcOf = (content: Uint8Array): string => formatCrc(crc32(content))

describe('crcsOf', () => {
  it('works out the CRC from each start in one pass, whatever the chunks', async () => {
    const content = Buffer.from(Array.from({ length: 1000 }, (_, index) => index % 251))
    const reader = memoryReader({ '/game': content }, 7)

    expect(await crcsOf(reader.chunks('/game'), [0, 16, 512])).toEqual([
      crcOf(content),
      crcOf(content.subarray(16)),
      crcOf(content.subarray(512))
    ])
  })
})

describe('checksumsOf', () => {
  it('works out the CRC of a whole file', async () => {
    const content = Buffer.alloc(3 * 1024, 7)
    const reader = memoryReader({ '/roms/game.gba': content })

    expect(await checksumsOf('/roms/game.gba', reader)).toEqual([crcOf(content)])
  })

  it('also works out the CRC without a SNES copier header', async () => {
    const rom = Buffer.alloc(2048, 3)
    const content = Buffer.concat([Buffer.alloc(512, 0xff), rom])
    const reader = memoryReader({ '/roms/game.smc': content })

    expect(await checksumsOf('/roms/game.smc', reader)).toEqual([crcOf(content), crcOf(rom)])
  })

  it('also works out the CRC without an iNES header', async () => {
    const header = Buffer.from([0x4e, 0x45, 0x53, 0x1a, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    const rom = Buffer.alloc(4096, 5)
    const reader = memoryReader({ '/roms/game.nes': Buffer.concat([header, rom]) })

    expect(await checksumsOf('/roms/game.nes', reader)).toContain(crcOf(rom))
  })

  it('gives none for an archive, known by its name only', async () => {
    const reader = memoryReader({ '/roms/kof2002.zip': Buffer.alloc(64, 1) })

    expect(await checksumsOf('/roms/kof2002.zip', reader)).toEqual([])
    expect(await checksumsOf('/roms/KOF2002.7Z', reader)).toEqual([])
  })

  it('gives none for a file that is empty or can’t be read', async () => {
    const reader = memoryReader({ '/roms/empty.gb': Buffer.alloc(0) })

    expect(await checksumsOf('/roms/empty.gb', reader)).toEqual([])
    expect(await checksumsOf('/roms/missing.gb', reader)).toEqual([])
  })
})
