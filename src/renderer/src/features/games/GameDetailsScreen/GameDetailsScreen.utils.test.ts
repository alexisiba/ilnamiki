import { describe, expect, it } from 'vitest'

import type { GameDetails } from '@shared/api'

import { NO_GAME_FACTS } from '@renderer/test/api'

import { gameFacts } from './GameDetailsScreen.utils'

const GAME: GameDetails = {
  id: 'g1',
  title: 'The Legend of Zelda - Link’s Awakening',
  platformId: 'game_boy',
  ...NO_GAME_FACTS,
  addedAt: 1,
  lastPlayedAt: null,
  playtimeMs: 0
}

const players = (count: number): string => `${count} players`

describe('gameFacts', () => {
  it('lists the year, genre, developer and players, in that order', () => {
    expect(
      gameFacts(
        {
          ...GAME,
          releaseYear: 1993,
          genre: 'Role-playing (RPG)',
          developer: 'Nintendo',
          publisher: 'Nintendo',
          players: 1
        },
        players
      )
    ).toEqual(['1993', 'Role-playing (RPG)', 'Nintendo', '1 players'])
  })

  it('leaves out what is unknown', () => {
    expect(gameFacts({ ...GAME, releaseYear: 2002, players: 2 }, players)).toEqual([
      '2002',
      '2 players'
    ])
  })

  it('lists nothing while the metadata knows nothing', () => {
    expect(gameFacts(GAME, players)).toEqual([])
  })
})
