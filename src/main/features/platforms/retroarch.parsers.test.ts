import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import { parseCoreFolders, parseCoreInfo, parseRetroArchSettings } from './retroarch.parsers'

/**
 * Real files captured from a RetroArch AppImage: core info files and an excerpt of its
 * configuration around the core folders.
 */
function fixture(name: string): string {
  return readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')
}

describe('parseRetroArchSettings', () => {
  it('reads quoted and unquoted values, skipping comments and empty lines', () => {
    const settings = parseRetroArchSettings(
      '# Software Information\n\ncorename = "Snes9x"\nfirmware_count = 1\r\npermissions = ""\n'
    )

    expect([...settings]).toEqual([
      ['corename', 'Snes9x'],
      ['firmware_count', '1'],
      ['permissions', '']
    ])
  })
})

describe('parseCoreFolders', () => {
  const resolve = (value: string | null): string => value ?? '<default>'

  it('reads the folders of the cores and their info files from RetroArch’s configuration', () => {
    expect(parseCoreFolders(fixture('retroarch-config.cfg'), resolve)).toEqual({
      cores: '~/.config/retroarch/cores',
      info: '~/.config/retroarch/cores'
    })
  })

  it('leaves a folder set to "default", empty or missing to its default', () => {
    const config = 'libretro_directory = "default"\nlibretro_info_path = ""\n'

    expect(parseCoreFolders(config, resolve)).toEqual({ cores: '<default>', info: '<default>' })
    expect(parseCoreFolders('', resolve)).toEqual({ cores: '<default>', info: '<default>' })
  })
})

describe('parseCoreInfo', () => {
  it('reads the core’s name, the platform it plays and its extensions', () => {
    expect(parseCoreInfo('mupen64plus_next', fixture('mupen64plus_next_libretro.info'))).toEqual({
      id: 'mupen64plus_next',
      name: 'Mupen64Plus-Next',
      platformId: 'nintendo_64',
      platformName: 'Nintendo 64',
      extensions: ['n64', 'v64', 'z64', 'ndd', 'bin', 'u1']
    })
  })

  it('reads an arcade core as RetroArch names its system', () => {
    expect(parseCoreInfo('hbmame', fixture('hbmame_libretro.info'))).toMatchObject({
      name: 'HBMAME (Git)',
      platformId: 'hbmame',
      platformName: 'Arcade (various)',
      extensions: ['zip', 'chd', '7z', 'cmd']
    })
  })

  it('writes extensions in lowercase, once each, and none when the core declares none', () => {
    const info = 'systemid = "nes"\nsystemname = "NES"\nsupported_extensions = "NES|nes| |fds"'

    expect(parseCoreInfo('mesen', info)?.extensions).toEqual(['nes', 'fds'])
    expect(parseCoreInfo('mesen', 'systemid = "nes"\nsystemname = "NES"')?.extensions).toEqual([])
  })

  it('names the core by its id when it declares no name', () => {
    expect(parseCoreInfo('mesen', 'systemid = "nes"\nsystemname = "NES"')?.name).toBe('mesen')
  })

  it('leaves out a core that doesn’t say which platform it plays', () => {
    expect(parseCoreInfo('2048', 'corename = "2048"\nsystemname = "2048"')).toBeNull()
    expect(parseCoreInfo('2048', 'corename = "2048"\nsystemid = "2048"')).toBeNull()
  })
})
