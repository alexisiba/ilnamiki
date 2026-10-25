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
    expect([...gameExtensionsOf('playstation', SWANSTATION_EXTENSIONS)]).toEqual([
      'cue',
      'bin',
      'img',
      'iso',
      'chd',
      'pbp',
      'ecm',
      'mds',
      'm3u'
    ])
  })

  it('keeps every extension of a platform without exceptions', () => {
    expect([...gameExtensionsOf('nintendo_64', ['n64', 'z64', 'bin'])]).toEqual([
      'n64',
      'z64',
      'bin'
    ])
  })
})
