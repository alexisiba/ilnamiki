import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HomeHero } from './HomeHero'
import type { LastPlayedGame } from './HomeHero.types'

const NOW = new Date('2026-10-22T18:00:00Z')

const GAME: LastPlayedGame = {
  title: 'The Legend of Zelda: Ocarina of Time',
  platform: 'Nintendo 64',
  description: 'Travel through time as Link.',
  imageUrl: 'artwork.webp',
  lastPlayedAt: new Date('2026-10-20T18:00:00Z'),
  playtimeMinutes: 32 * 60 + 15
}

describe('HomeHero', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the game as the main heading with its platform and description', () => {
    render(<HomeHero game={GAME} />)

    expect(screen.getByRole('heading', { level: 1, name: GAME.title })).toBeInTheDocument()
    expect(screen.getByText('Nintendo 64')).toBeInTheDocument()
    expect(screen.getByText(GAME.description)).toBeInTheDocument()
    expect(screen.getByText('Resume session')).toBeInTheDocument()
  })

  it('shows when the game was last played and the total playtime', () => {
    render(<HomeHero game={GAME} />)

    expect(screen.getByText('Last played 2 days ago')).toBeInTheDocument()
    expect(screen.getByText('Total playtime: 32 h 15 min')).toBeInTheDocument()
  })

  it('focuses the continue playing action', () => {
    render(<HomeHero game={GAME} />)

    expect(screen.getByRole('button', { name: 'Continue playing' })).toHaveFocus()
  })

  it('treats the artwork as decorative', () => {
    render(<HomeHero game={GAME} />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
