import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import { findKnownEmulator, parseRetroArchVersion } from './emulators.catalog'

/** Real output captured from RetroArch's AppImage. */
const RETROARCH_VERSION_OUTPUT = readFileSync(
  new URL('./providers/fixtures/retroarch-version.txt', import.meta.url),
  'utf8'
)

describe('findKnownEmulator', () => {
  it('recognizes RetroArch by its desktop entry', () => {
    expect(findKnownEmulator('com.libretro.RetroArch')?.kind).toBe('retroarch')
  })

  it('recognizes nothing else', () => {
    expect(findKnownEmulator('org.example.Editor')).toBeUndefined()
  })
})

describe('parseRetroArchVersion', () => {
  it('reads the version RetroArch prints, after the AppImage’s own lines', () => {
    expect(parseRetroArchVersion(RETROARCH_VERSION_OUTPUT)).toBe('1.22.2')
  })

  it('says nothing when there is no version line', () => {
    expect(parseRetroArchVersion('RetroArch - Frontend for libretro\n')).toBeNull()
  })
})
