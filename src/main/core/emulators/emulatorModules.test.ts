import { describe, expect, it } from 'vitest'

import { findModule, findModuleByDesktopId } from './emulatorModules'

describe('findModuleByDesktopId', () => {
  it('recognizes RetroArch by its desktop entry', () => {
    expect(findModuleByDesktopId('com.libretro.RetroArch')?.kind).toBe('retroarch')
  })

  it('recognizes nothing else', () => {
    expect(findModuleByDesktopId('org.example.Editor')).toBeUndefined()
  })
})

describe('findModule', () => {
  it('finds the module of a known emulator', () => {
    expect(findModule('retroarch')?.kind).toBe('retroarch')
  })

  it('finds none for an emulator Ilnamiki doesn’t know', () => {
    expect(findModule('unknown')).toBeUndefined()
  })
})
