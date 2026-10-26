import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithNavigation } from '@renderer/test/renderWithNavigation'

import { ContinueHero } from './ContinueHero'
import type { ContinueGame } from './ContinueHero.types'

const NOW = new Date('2026-10-22T18:00:00Z')

const DESCRIPTION = 'Travel through time as Link.'

const GAME: ContinueGame = {
  title: 'The Legend of Zelda: Ocarina of Time',
  platform: 'Nintendo 64',
  description: DESCRIPTION,
  imageUrl: 'artwork.webp',
  lastPlayedAt: new Date('2026-10-20T18:00:00Z'),
  playtimeMinutes: 32 * 60 + 15
}

describe('ContinueHero', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the game as the main heading with its platform and description', () => {
    render(<ContinueHero game={GAME} />)

    expect(screen.getByRole('heading', { level: 1, name: GAME.title })).toBeInTheDocument()
    expect(screen.getByText('Nintendo 64')).toBeInTheDocument()
    expect(screen.getByText(DESCRIPTION)).toBeInTheDocument()
    expect(screen.getByText('Resume session')).toBeInTheDocument()
  })

  it('leaves the description out while the game has none', () => {
    render(<ContinueHero game={{ ...GAME, description: null }} />)

    expect(screen.queryByText(DESCRIPTION)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: GAME.title })).toBeInTheDocument()
  })

  it('shows when the game was last played and the total playtime', () => {
    render(<ContinueHero game={GAME} />)

    expect(screen.getByText('Last played 2 days ago')).toBeInTheDocument()
    expect(screen.getByText('Total playtime: 32 h 15 min')).toBeInTheDocument()
  })

  it('focuses the continue playing action', () => {
    renderWithNavigation(<ContinueHero game={GAME} />)

    expect(screen.getByRole('button', { name: 'Continue playing' })).toHaveFocus()
  })

  it('treats the artwork as decorative', () => {
    render(<ContinueHero game={GAME} />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
