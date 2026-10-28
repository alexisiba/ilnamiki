import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import {
  gameDatabasesOf,
  parseCoreFolders,
  parseCoreInfo,
  parseDatabaseFolder,
  parseRetroArchSettings,
  parseRetroArchVersion
} from './retroarch.parsers'
import type { RetroArchCore } from './retroarch.types'

/**
 * Real files captured from a RetroArch AppImage: core info files, an excerpt of its
 * configuration around the core folders and what `--version` prints.
 */
function fixture(name: string): string {
  return readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')
}

describe('parseRetroArchVersion', () => {
  it('reads the version RetroArch prints, after the AppImage’s own lines', () => {
    expect(parseRetroArchVersion(fixture('retroarch-version.txt'))).toBe('1.22.2')
  })

  it('says nothing when there is no version line', () => {
    expect(parseRetroArchVersion('RetroArch - Frontend for libretro\n')).toBeNull()
  })
})

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

describe('parseDatabaseFolder', () => {
  const resolve = (value: string | null): string => value ?? '<default>'

  it('reads the folder of the game databases from RetroArch’s configuration', () => {
    expect(parseDatabaseFolder(fixture('retroarch-config.cfg'), resolve)).toBe(
      '~/.config/retroarch/database/rdb'
    )
  })

  it('leaves the folder set to "default", empty or missing to its default', () => {
    expect(parseDatabaseFolder('content_database_path = "default"\n', resolve)).toBe('<default>')
    expect(parseDatabaseFolder('content_database_path = ""\n', resolve)).toBe('<default>')
    expect(parseDatabaseFolder('', resolve)).toBe('<default>')
  })
})

describe('gameDatabasesOf', () => {
  const core = (id: string, platformId: string, databases: string[]): RetroArchCore => ({
    id,
    name: id,
    platformId,
    platformName: platformId,
    platformManufacturer: null,
    extensions: [],
    databases
  })

  it('lists each database of each platform once, as a file of the database folder', () => {
    const cores = [
      core('gambatte', 'game_boy', ['Nintendo - Game Boy', 'Nintendo - Game Boy Color']),
      core('sameboy', 'game_boy', ['Nintendo - Game Boy']),
      core('mupen64plus_next', 'nintendo_64', ['Nintendo - Nintendo 64'])
    ]

    expect(gameDatabasesOf(cores, '/rdb')).toEqual([
      {
        platformId: 'game_boy',
        format: 'libretro-rdb',
        name: 'Nintendo - Game Boy',
        path: '/rdb/Nintendo - Game Boy.rdb'
      },
      {
        platformId: 'game_boy',
        format: 'libretro-rdb',
        name: 'Nintendo - Game Boy Color',
        path: '/rdb/Nintendo - Game Boy Color.rdb'
      },
      {
        platformId: 'nintendo_64',
        format: 'libretro-rdb',
        name: 'Nintendo - Nintendo 64',
        path: '/rdb/Nintendo - Nintendo 64.rdb'
      }
    ])
  })

  it('keeps a database two platforms share once for each', () => {
    const cores = [
      core('genesis_plus_gx', 'mega_drive', ['Sega - Game Gear']),
      core('gearsystem', 'game_gear', ['Sega - Game Gear'])
    ]

    expect(gameDatabasesOf(cores, '/rdb').map(({ platformId }) => platformId)).toEqual([
      'mega_drive',
      'game_gear'
    ])
  })
})

describe('parseCoreInfo', () => {
  it('reads the core’s name, the platform it plays and its extensions', () => {
    expect(parseCoreInfo('mupen64plus_next', fixture('mupen64plus_next_libretro.info'))).toEqual({
      id: 'mupen64plus_next',
      name: 'Mupen64Plus-Next',
      platformId: 'nintendo_64',
      platformName: 'Nintendo 64',
      platformManufacturer: 'Nintendo',
      extensions: ['n64', 'v64', 'z64', 'ndd', 'bin', 'u1'],
      databases: ['Nintendo - Nintendo 64']
    })
  })

  it('reads every database of the platform, once each, and none when the core names none', () => {
    const info =
      'systemid = "game_boy"\nsystemname = "Game Boy"\n' +
      'database = "Nintendo - Game Boy|Nintendo - Game Boy Color| |Nintendo - Game Boy"'

    expect(parseCoreInfo('gambatte', info)?.databases).toEqual([
      'Nintendo - Game Boy',
      'Nintendo - Game Boy Color'
    ])
    expect(parseCoreInfo('mesen', 'systemid = "nes"\nsystemname = "NES"')?.databases).toEqual([])
  })

  it('leaves the manufacturer out when the core doesn’t say it', () => {
    const info = 'systemid = "psp"\nsystemname = "PSP"\nmanufacturer = ""'

    expect(parseCoreInfo('ppsspp', info)?.platformManufacturer).toBeNull()
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
