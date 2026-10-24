import { describe, expect, it } from 'vitest'

import i18n from '@renderer/core/i18n'

import { formatPlaytime, formatTimeSince } from './time'

const NOW = new Date('2026-10-22T18:00:00Z')
const hoursAgo = (hours: number): Date => new Date(NOW.getTime() - hours * 60 * 60 * 1000)

describe('formatTimeSince', () => {
  it.each([
    [0.5, '30 minutes ago'],
    [3, '3 hours ago'],
    [24, 'yesterday'],
    [48, '2 days ago'],
    [24 * 14, '2 weeks ago'],
    [24 * 90, '3 months ago'],
    [24 * 365 * 2, '2 years ago']
  ])('formats %s hours ago as "%s"', (hours, expected) => {
    expect(formatTimeSince(hoursAgo(hours), NOW, 'en')).toBe(expected)
  })

  it('uses the given locale', () => {
    expect(formatTimeSince(hoursAgo(3), NOW, 'es')).toBe('hace 3 horas')
  })

  it('treats future dates as now', () => {
    expect(formatTimeSince(hoursAgo(-5), NOW, 'en')).toBe('this minute')
  })
})

describe('formatPlaytime', () => {
  const t = i18n.getFixedT('en', 'common')

  it('shows hours and minutes', () => {
    expect(formatPlaytime(32 * 60 + 15, t)).toBe('32 h 15 min')
  })

  it('omits zero minutes', () => {
    expect(formatPlaytime(120, t)).toBe('2 h')
  })

  it('shows only minutes under an hour', () => {
    expect(formatPlaytime(45, t)).toBe('45 min')
  })
})
