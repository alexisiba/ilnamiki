import { describe, expect, it } from 'vitest'

import { parseGameId } from './games.validation'

describe('parseGameId', () => {
  it('accepts a game id', () => {
    expect(parseGameId('0b6c7b5e-3f43-4c1e-9d2a-6f0e8a1b2c3d')).toBe(
      '0b6c7b5e-3f43-4c1e-9d2a-6f0e8a1b2c3d'
    )
  })

  it('rejects anything else', () => {
    expect(parseGameId('../../etc/passwd')).toBeNull()
    expect(parseGameId(7)).toBeNull()
  })
})
