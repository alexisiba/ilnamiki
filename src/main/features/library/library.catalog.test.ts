import { describe, expect, it } from 'vitest'

import { gameExtensionsOf } from './library.catalog'

/** SwanStation's extensions, as RetroArch declares them. */
const SWANSTATION_EXTENSIONS = [
  'exe',
  'psexe',
  'cue',
  'bin',
  'img',
  'iso',
  'chd',
  'pbp',
  'ecm',
  'mds',
  'psf',
  'm3u'
]

describe('gameExtensionsOf', () => {
  it('leaves out PlayStation executables and sound files', () => {
    const extensions = gameExtensionsOf('playstation', SWANSTATION_EXTENSIONS)

    expect(extensions.has('exe')).toBe(false)
    expect(extensions.has('psexe')).toBe(false)
    expect(extensions.has('psf')).toBe(false)
    expect(extensions.has('cue')).toBe(true)
  })

  it('takes only what the emulators declare, without archives they don’t', () => {
    expect([...gameExtensionsOf('nintendo_64', ['n64', 'z64', 'bin'])]).toEqual([
      'n64',
      'z64',
      'bin'
    ])
  })

  it('takes archives as games when an emulator declares them', () => {
    expect([...gameExtensionsOf('hbmame', ['zip', 'chd', '7z', 'cmd'])]).toEqual([
      'zip',
      'chd',
      '7z',
      'cmd'
    ])
  })
})
