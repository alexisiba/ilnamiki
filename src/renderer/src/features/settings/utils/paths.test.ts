import { describe, expect, it } from 'vitest'

import { isAbsolutePath } from './paths'

describe('isAbsolutePath', () => {
  it('accepts paths from the root and Windows drives', () => {
    expect(isAbsolutePath('/home/player/RetroArch.AppImage')).toBe(true)
    expect(isAbsolutePath('C:\\Emulators\\retroarch.exe')).toBe(true)
    expect(isAbsolutePath('D:/Emulators/retroarch.exe')).toBe(true)
  })

  it('refuses relative paths', () => {
    expect(isAbsolutePath('RetroArch.AppImage')).toBe(false)
    expect(isAbsolutePath('./RetroArch.AppImage')).toBe(false)
    expect(isAbsolutePath('~/RetroArch.AppImage')).toBe(false)
    expect(isAbsolutePath('')).toBe(false)
  })
})
