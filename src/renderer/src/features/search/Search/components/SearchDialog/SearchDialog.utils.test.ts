import { describe, expect, it } from 'vitest'

import type { Game } from '@renderer/types/game'

import { searchGames } from './SearchDialog.utils'

const game = (title: string): Game =>
  ({ id: title.toLowerCase().replaceAll(' ', '-'), title }) as Game
const titles = (games: Game[]): string[] => games.map(({ title }) => title)

const LIBRARY = ['Pokémon Red', 'Metal Gear Solid', 'Metal Slug', 'Super Mario Bros. 3'].map(game)

describe('searchGames', () => {
  it('finds the games whose title contains the text, in library order', () => {
    expect(titles(searchGames('metal', LIBRARY, 20))).toEqual(['Metal Gear Solid', 'Metal Slug'])
    expect(titles(searchGames('bros', LIBRARY, 20))).toEqual(['Super Mario Bros. 3'])
  })

  it('ignores case, accents and the spaces around the text', () => {
    expect(titles(searchGames('  POKEMON ', LIBRARY, 20))).toEqual(['Pokémon Red'])
    expect(titles(searchGames('pokémon', LIBRARY, 20))).toEqual(['Pokémon Red'])
  })

  it('keeps only the first matches up to the limit', () => {
    const library = Array.from({ length: 25 }, (_, index) => game(`Game ${index + 1}`))

    const found = searchGames('game', library, 20)

    expect(found).toHaveLength(20)
    expect(found.at(-1)?.title).toBe('Game 20')
  })

  it('finds nothing for empty text or when no title matches', () => {
    expect(searchGames('   ', LIBRARY, 20)).toEqual([])
    expect(searchGames('zelda', LIBRARY, 20)).toEqual([])
  })
})
