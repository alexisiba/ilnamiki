import { describe, expect, it } from 'vitest'

import { findCatalogPlatform } from './platformCatalog'

describe('findCatalogPlatform', () => {
  it('names a known platform and gives its manufacturer and year', () => {
    expect(findCatalogPlatform('nintendo_64')).toEqual({
      name: 'Nintendo 64',
      manufacturer: 'Nintendo',
      releaseYear: 1996
    })
  })

  it('knows nothing about other platforms', () => {
    expect(findCatalogPlatform('quake_3')).toBeUndefined()
  })
})
