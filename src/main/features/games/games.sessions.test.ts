import { describe, expect, it } from 'vitest'

import { isPlaySession, MIN_PLAY_SESSION_MS } from './games.sessions'

const STARTED_AT = 1_800_000_000_000

describe('isPlaySession', () => {
  it('counts a game open for the shortest time or longer as played', () => {
    expect(isPlaySession(STARTED_AT, STARTED_AT + MIN_PLAY_SESSION_MS)).toBe(true)
    expect(isPlaySession(STARTED_AT, STARTED_AT + 45 * 60 * 1000)).toBe(true)
  })

  it('leaves out a game closed sooner', () => {
    expect(isPlaySession(STARTED_AT, STARTED_AT + MIN_PLAY_SESSION_MS - 1)).toBe(false)
    expect(isPlaySession(STARTED_AT, STARTED_AT + 2000)).toBe(false)
  })
})
