import { describe, expect, it } from 'vitest'

import {
  coreIdOf,
  coreInfoFileOf,
  coreLibraryFileOf,
  resolveRetroArchFolder
} from './linux.parsers'

const HOME = '/home/user/RetroArch-Linux-x86_64.AppImage.home'
const DEFAULT_FOLDER = `${HOME}/.config/retroarch/cores`

describe('resolveRetroArchFolder', () => {
  it('reads ~ as the home folder RetroArch runs with', () => {
    expect(resolveRetroArchFolder('~/.config/retroarch/cores', HOME, DEFAULT_FOLDER)).toBe(
      `${HOME}/.config/retroarch/cores`
    )
    expect(resolveRetroArchFolder('~', HOME, DEFAULT_FOLDER)).toBe(HOME)
  })

  it('keeps an absolute folder', () => {
    expect(resolveRetroArchFolder('/opt/retroarch/cores/', HOME, DEFAULT_FOLDER)).toBe(
      '/opt/retroarch/cores/'
    )
  })

  it('uses the default folder for one left to its default or that isn’t absolute', () => {
    expect(resolveRetroArchFolder(null, HOME, DEFAULT_FOLDER)).toBe(DEFAULT_FOLDER)
    expect(resolveRetroArchFolder('cores', HOME, DEFAULT_FOLDER)).toBe(DEFAULT_FOLDER)
    expect(resolveRetroArchFolder(':/cores', HOME, DEFAULT_FOLDER)).toBe(DEFAULT_FOLDER)
  })
})

describe('coreIdOf', () => {
  it('reads the core’s id from its library’s file name', () => {
    expect(coreIdOf('mupen64plus_next_libretro.so')).toBe('mupen64plus_next')
    expect(coreIdOf('bsnes-jg_libretro.so')).toBe('bsnes-jg')
  })

  it('skips files that aren’t a core’s library', () => {
    expect(coreIdOf('mupen64plus_next_libretro.info')).toBeNull()
    expect(coreIdOf('core_info.refresh')).toBeNull()
    expect(coreIdOf('_libretro.so')).toBeNull()
  })
})

describe('coreLibraryFileOf', () => {
  it('names the core’s library, which coreIdOf reads back', () => {
    expect(coreLibraryFileOf('mupen64plus_next')).toBe('mupen64plus_next_libretro.so')
    expect(coreIdOf(coreLibraryFileOf('mupen64plus_next'))).toBe('mupen64plus_next')
  })
})

describe('coreInfoFileOf', () => {
  it('names the info file next to the core’s library', () => {
    expect(coreInfoFileOf('mupen64plus_next')).toBe('mupen64plus_next_libretro.info')
  })
})
