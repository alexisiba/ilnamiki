import { describe, expect, it } from 'vitest'

import { gameExtensionsOf } from './library.catalog'

/** SwanStation's extensions, as its core info file declares them. */
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

  it('takes archives as games, though the cores don’t declare them', () => {
    expect([...gameExtensionsOf('nintendo_64', ['n64', 'z64', 'bin'])]).toEqual([
      'n64',
      'z64',
      'bin',
      'zip',
      '7z'
    ])
  })

  it('lists an archive once when a core also declares it', () => {
    expect([...gameExtensionsOf('hbmame', ['zip', 'chd', '7z', 'cmd'])]).toEqual([
      'zip',
      'chd',
      '7z',
      'cmd'
    ])
  })
})
