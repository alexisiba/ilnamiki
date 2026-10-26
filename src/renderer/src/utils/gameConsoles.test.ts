import { describe, expect, it } from 'vitest'

import type { GameFolder, InstalledPlatform } from '@shared/api'

import { toGameConsoles } from './gameConsoles'

const platform = (id: string, name: string, manufacturer: string | null): InstalledPlatform => ({
  id,
  name,
  manufacturer,
  cores: [{ id: `${id}-core`, name: 'Core', emulatorId: 'a1', extensions: [] }],
  isEnabled: true
})

const folder = (platformId: string, gameCount: number): GameFolder => ({
  id: `${platformId}-folder`,
  path: `/home/player/Games/${platformId}`,
  platformId,
  gameCount,
  isAvailable: true,
  addedAt: 1
})

describe('toGameConsoles', () => {
  it('makes a console of each installed platform whose folder has games', () => {
    const platforms = [
      platform('playstation', 'PlayStation', 'Sony'),
      platform('nintendo_64', 'Nintendo 64', 'Nintendo'),
      platform('xbox', 'Xbox', 'Microsoft')
    ]

    const consoles = toGameConsoles(platforms, [folder('playstation', 24), folder('xbox', 0)])

    expect(consoles.map(({ id, gameCount }) => ({ id, gameCount }))).toEqual([
      { id: 'playstation', gameCount: 24 }
    ])
  })

  it('leaves out the platforms turned off, with their games', () => {
    const platforms = [
      platform('playstation', 'PlayStation', 'Sony'),
      { ...platform('nintendo_64', 'Nintendo 64', 'Nintendo'), isEnabled: false }
    ]

    const consoles = toGameConsoles(platforms, [folder('playstation', 2), folder('nintendo_64', 5)])

    expect(consoles.map(({ id }) => id)).toEqual(['playstation'])
  })

  it('leaves out folders of platforms no installed core plays', () => {
    expect(toGameConsoles([], [folder('playstation', 24)])).toEqual([])
  })

  it('names a known platform as the catalog does, with its year and render', () => {
    const multiSystem = platform('nes', 'Nintendo Entertainment System / Game Boy / …', 'Various')

    expect(toGameConsoles([multiSystem], [folder('nes', 56)])).toEqual([
      {
        id: 'nes',
        name: 'NES',
        manufacturer: 'Nintendo',
        releaseYear: 1983,
        imageUrl: expect.stringContaining('nes'),
        gameCount: 56
      }
    ])
  })

  it('keeps what the cores say about a platform the catalog doesn’t know', () => {
    expect(
      toGameConsoles([platform('quake_3', 'Quake III', 'id Software')], [folder('quake_3', 1)])
    ).toEqual([
      {
        id: 'quake_3',
        name: 'Quake III',
        manufacturer: 'id Software',
        releaseYear: null,
        imageUrl: null,
        gameCount: 1
      }
    ])
  })

  it('sorts the consoles by name', () => {
    const platforms = [
      platform('xbox', 'Xbox', 'Microsoft'),
      platform('gamecube', 'GameCube / Wii', 'Nintendo'),
      platform('dreamcast', 'Dreamcast', 'Sega')
    ]
    const folders = [folder('xbox', 1), folder('gamecube', 1), folder('dreamcast', 1)]

    expect(toGameConsoles(platforms, folders).map(({ name }) => name)).toEqual([
      'Dreamcast',
      'GameCube',
      'Xbox'
    ])
  })
})
