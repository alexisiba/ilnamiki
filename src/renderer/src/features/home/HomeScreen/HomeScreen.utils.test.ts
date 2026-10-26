import { describe, expect, it } from 'vitest'

import type { InstalledPlatform, LastPlayedGame } from '@shared/api'

import { formatLastPlayed, toContinueGame, toRecentlyAddedShelfGame } from './HomeScreen.utils'

const CRASH: LastPlayedGame = {
  id: 'g1',
  title: 'Crash Bandicoot',
  platformId: 'playstation',
  lastPlayedAt: 1_800_000_000_000,
  playtimeMs: (2 * 60 + 15) * 60 * 1000 + 40 * 1000
}

const platform = (id: string, name: string): InstalledPlatform => ({
  id,
  name,
  manufacturer: null,
  cores: [],
  isEnabled: true
})

describe('toContinueGame', () => {
  it('names the console as the catalog does and shows its render', () => {
    const game = toContinueGame(CRASH, [platform('playstation', 'Sony - PlayStation')])

    expect(game).toMatchObject({
      id: 'g1',
      title: 'Crash Bandicoot',
      platform: 'PlayStation',
      description: null,
      lastPlayedAt: new Date(1_800_000_000_000)
    })
    expect(game.imageUrl).toEqual(expect.stringContaining('ps1'))
  })

  it('rounds the playtime to minutes', () => {
    expect(toContinueGame(CRASH, []).playtimeMinutes).toBe(2 * 60 + 16)
  })

  it('names a console the catalog doesn’t know as its cores do, with Home’s artwork', () => {
    const game = toContinueGame({ ...CRASH, platformId: 'quake_3' }, [
      platform('quake_3', 'Quake III')
    ])

    expect(game.platform).toBe('Quake III')
    expect(game.imageUrl).toEqual(expect.stringContaining('consoles'))
  })

  it('names a console no emulator plays anymore by its id', () => {
    expect(toContinueGame({ ...CRASH, platformId: 'quake_3' }, []).platform).toBe('quake_3')
  })
})

describe('toRecentlyAddedShelfGame', () => {
  it('names the console as the catalog does and shows the generic game image', () => {
    const game = toRecentlyAddedShelfGame(
      { id: 'g1', title: 'Crash Bandicoot', platformId: 'playstation', addedAt: 1 },
      [platform('playstation', 'Sony - PlayStation')]
    )

    expect(game).toMatchObject({ id: 'g1', title: 'Crash Bandicoot', platform: 'PlayStation' })
    expect(game.imageUrl).toEqual(expect.stringContaining('no-image'))
  })
})

// Thursday, 22 October 2026, 18:00 local time.
const NOW = new Date(2026, 9, 22, 18, 0)
const daysAgo = (days: number, hour = 12): Date => new Date(2026, 9, 22 - days, hour, 30)

describe('formatLastPlayed', () => {
  it('shows the time for games played today', () => {
    expect(formatLastPlayed(daysAgo(0, 9), NOW, 'en')).toBe('9:30 AM')
  })

  it('shows yesterday for games played the previous calendar day', () => {
    expect(formatLastPlayed(daysAgo(1, 23), NOW, 'en')).toBe('yesterday')
    expect(formatLastPlayed(daysAgo(1), NOW, 'es')).toBe('ayer')
  })

  it('shows the weekday within the last week', () => {
    expect(formatLastPlayed(daysAgo(3), NOW, 'en')).toBe('Monday')
    expect(formatLastPlayed(daysAgo(6), NOW, 'es')).toBe('viernes')
  })

  it('shows the date for older games', () => {
    expect(formatLastPlayed(daysAgo(12), NOW, 'en')).toBe('Oct 10')
  })

  it('adds the year when it is not the current one', () => {
    expect(formatLastPlayed(new Date(2025, 11, 3), NOW, 'en')).toBe('Dec 3, 2025')
  })
})
