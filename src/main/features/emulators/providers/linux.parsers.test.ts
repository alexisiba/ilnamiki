import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import {
  desktopIdOf,
  iconTypeOf,
  isAppImageHeader,
  parseDesktopEntry,
  resolveLinkInside
} from './linux.parsers'

/** Real files captured from RetroArch's and Eden's AppImages. */
function fixture(name: string): string {
  return readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')
}

/** First bytes of RetroArch's AppImage, as read from the file. */
const APPIMAGE_HEADER = Uint8Array.from([
  0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00, 0x41, 0x49, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00
])

/** First bytes of a plain ELF executable (`/usr/bin/ls`). */
const ELF_HEADER = Uint8Array.from([
  0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
])

describe('isAppImageHeader', () => {
  it('recognizes a type 2 AppImage', () => {
    expect(isAppImageHeader(APPIMAGE_HEADER)).toBe(true)
  })

  it('rejects an executable that is not an AppImage', () => {
    expect(isAppImageHeader(ELF_HEADER)).toBe(false)
  })

  it('rejects a file that is not an executable, or too short to tell', () => {
    expect(isAppImageHeader(new TextEncoder().encode('#!/bin/sh\necho hi\n'))).toBe(false)
    expect(isAppImageHeader(APPIMAGE_HEADER.slice(0, 8))).toBe(false)
  })
})

describe('parseDesktopEntry', () => {
  it('reads the untranslated name and the icon of RetroArch’s entry, which declares no version', () => {
    expect(parseDesktopEntry(fixture('retroarch-desktop-entry.desktop'))).toEqual({
      name: 'RetroArch',
      icon: 'com.libretro.RetroArch',
      version: null
    })
  })

  it('reads the version an AppImage declares in its entry', () => {
    expect(parseDesktopEntry(fixture('eden-desktop-entry.desktop'))).toEqual({
      name: 'Eden',
      icon: 'dev.eden_emu.eden',
      version: 'v0.2.1'
    })
  })

  it('ignores other groups, comments and empty values', () => {
    const text = [
      '# A comment',
      '[Desktop Entry]',
      'Name=',
      'Icon=emulator',
      '[Desktop Action Fullscreen]',
      'Name=Fullscreen'
    ].join('\n')

    expect(parseDesktopEntry(text)).toEqual({ name: null, icon: 'emulator', version: null })
  })
})

describe('desktopIdOf', () => {
  it('drops the extension', () => {
    expect(desktopIdOf('com.libretro.RetroArch.desktop')).toBe('com.libretro.RetroArch')
  })
})

describe('resolveLinkInside', () => {
  it('follows a link relative to the image root, as RetroArch’s desktop entry is', () => {
    expect(
      resolveLinkInside(
        'com.libretro.RetroArch.desktop',
        'usr/share/applications/com.libretro.RetroArch.desktop'
      )
    ).toBe('usr/share/applications/com.libretro.RetroArch.desktop')
  })

  it('follows links relative to the folder they are in', () => {
    expect(resolveLinkInside('usr/share/icon.svg', '../pixmaps/icon.svg')).toBe(
      'usr/pixmaps/icon.svg'
    )
  })

  it('refuses links that leave the image', () => {
    expect(resolveLinkInside('icon.svg', '/usr/share/icons/icon.svg')).toBeNull()
    expect(resolveLinkInside('icon.svg', '../../etc/passwd')).toBeNull()
  })
})

describe('iconTypeOf', () => {
  it('knows the icon formats the app shows', () => {
    expect(iconTypeOf('com.libretro.RetroArch.svg')).toBe('image/svg+xml')
    expect(iconTypeOf('emulator.PNG')).toBe('image/png')
    expect(iconTypeOf('emulator.xpm')).toBeNull()
  })
})
