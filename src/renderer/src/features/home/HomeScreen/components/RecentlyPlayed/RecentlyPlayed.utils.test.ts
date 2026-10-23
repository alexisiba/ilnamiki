import { describe, expect, it } from 'vitest'

import { formatLastPlayed } from './RecentlyPlayed.utils'

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
