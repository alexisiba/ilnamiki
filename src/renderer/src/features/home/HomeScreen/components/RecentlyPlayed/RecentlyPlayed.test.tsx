import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RecentlyPlayed } from './RecentlyPlayed'
import type { RecentGame } from './RecentlyPlayed.types'

const NOW = new Date(2026, 9, 22, 18, 0)

const GAMES: RecentGame[] = [
  {
    id: 'dk-64',
    title: 'Donkey Kong 64',
    platform: 'Nintendo 64',
    imageUrl: 'dk.jpg',
    lastPlayedAt: new Date(2026, 9, 21, 20, 0)
  },
  {
    id: 'mgs-ps1',
    title: 'Metal Gear Solid',
    platform: 'PlayStation',
    imageUrl: 'mgs.jpg',
    lastPlayedAt: new Date(2026, 9, 22, 9, 30)
  }
]

describe('RecentlyPlayed', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the section heading', () => {
    render(<RecentlyPlayed games={GAMES} />)

    expect(screen.getByRole('heading', { level: 2, name: 'Play again' })).toBeInTheDocument()
  })

  it('shows one card per game, in order, with platform and last played', () => {
    render(<RecentlyPlayed games={GAMES} />)

    const [first, second] = screen.getAllByRole('listitem')
    expect(within(first).getByRole('heading', { name: 'Donkey Kong 64' })).toBeInTheDocument()
    expect(within(first).getByText('Nintendo 64')).toBeInTheDocument()
    expect(within(first).getByText('yesterday')).toBeInTheDocument()
    expect(within(second).getByRole('heading', { name: 'Metal Gear Solid' })).toBeInTheDocument()
    expect(within(second).getByText('9:30 AM')).toBeInTheDocument()
  })
})
