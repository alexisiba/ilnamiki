import { describe, expect, it } from 'vitest'

import { findCatalogPlatform, getCatalogPlatform, ignoredExtensionsOf } from './platformCatalog'

describe('findCatalogPlatform', () => {
  it('names a known platform and gives its manufacturer and year', () => {
    expect(findCatalogPlatform('nintendo_64')).toEqual({
      name: 'Nintendo 64',
      manufacturer: 'Nintendo',
      releaseYear: 1996
    })
  })

  it('leaves out which extensions are never games', () => {
    expect(findCatalogPlatform('playstation')).toEqual({
      name: 'PlayStation',
      manufacturer: 'Sony',
      releaseYear: 1994
    })
  })

  it('knows nothing about other platforms', () => {
    expect(findCatalogPlatform('quake_3')).toBeUndefined()
  })
})

describe('getCatalogPlatform', () => {
  it('knows the platforms RetroArch doesn’t play', () => {
    expect(getCatalogPlatform('switch')).toEqual({
      name: 'Nintendo Switch',
      manufacturer: 'Nintendo',
      releaseYear: 2017
    })
  })
})

describe('ignoredExtensionsOf', () => {
  it("gives a platform's extensions that are never games", () => {
    expect(ignoredExtensionsOf('playstation')).toEqual(['exe', 'psexe', 'psf'])
  })

  it('gives none for platforms without them, or unknown ones', () => {
    expect(ignoredExtensionsOf('nintendo_64')).toEqual([])
    expect(ignoredExtensionsOf('quake_3')).toEqual([])
  })
})
