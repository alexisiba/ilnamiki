import { describe, expect, it } from 'vitest'

import { inRandomOrder, onPlayablePlatforms } from './games.random'

const game = (id: string, platformId: string): { id: string; platformId: string } => ({
  id,
  platformId
})

describe('onPlayablePlatforms', () => {
  it('keeps the games of every playable platform, in order', () => {
    const games = [game('g1', 'nes'), game('g2', 'playstation'), game('g3', 'nes')]

    expect(onPlayablePlatforms(games, new Set(['nes', 'playstation']))).toEqual(games)
  })

  it('leaves out the games of a platform no installed core plays', () => {
    const games = [game('g1', 'nes'), game('g2', 'playstation')]

    expect(onPlayablePlatforms(games, new Set(['playstation']))).toEqual([
      game('g2', 'playstation')
    ])
    expect(onPlayablePlatforms(games, new Set())).toEqual([])
  })
})

describe('inRandomOrder', () => {
  it('moves each item to the place the random numbers choose', () => {
    // Each step swaps the last unplaced item with the one at floor(random × unplaced):
    // d↔a gives [d, b, c, a], then c↔b gives [d, c, b, a], then c stays.
    const numbers = [0, 0.5, 0.9]
    const random = (): number => numbers.shift() ?? 0

    expect(inRandomOrder(['a', 'b', 'c', 'd'], random)).toEqual(['d', 'c', 'b', 'a'])
  })

  it('keeps every item once, without changing the list it was given', () => {
    const items = ['a', 'b', 'c', 'd', 'e']

    const shuffled = inRandomOrder(items)

    expect([...shuffled].sort()).toEqual(items)
    expect(items).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('orders an empty list or a single item as it is', () => {
    expect(inRandomOrder([])).toEqual([])
    expect(inRandomOrder(['a'])).toEqual(['a'])
  })
})
