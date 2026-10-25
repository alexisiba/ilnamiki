import { describe, expect, it } from 'vitest'

import { findCatalogPlatform } from './platformCatalog'

describe('findCatalogPlatform', () => {
  it('names a known platform and gives its manufacturer, year and render', () => {
    expect(findCatalogPlatform('nintendo_64')).toEqual({
      name: 'Nintendo 64',
      manufacturer: 'Nintendo',
      releaseYear: 1996,
      imageUrl: expect.stringContaining('n64')
    })
  })

  it('finds the image of every platform that names one', () => {
    expect(findCatalogPlatform('hbmame')?.imageUrl).toEqual(expect.stringContaining('hbmame'))
  })

  it('has no render for a known platform the app ships none for', () => {
    expect(findCatalogPlatform('dreamcast')).toMatchObject({ name: 'Dreamcast', imageUrl: null })
  })

  it('knows nothing about other platforms', () => {
    expect(findCatalogPlatform('quake_3')).toBeUndefined()
  })
})
