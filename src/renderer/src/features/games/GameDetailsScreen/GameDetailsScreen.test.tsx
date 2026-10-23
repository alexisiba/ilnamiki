import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { GAME_DETAILS_PATH, NavigationProvider } from '@renderer/core/navigation'

import { GameDetailsScreen } from './GameDetailsScreen'

function renderDetailsOf(gameId: string): void {
  const router = createMemoryRouter(
    [
      {
        path: GAME_DETAILS_PATH,
        element: (
          <NavigationProvider>
            <GameDetailsScreen />
          </NavigationProvider>
        )
      }
    ],
    { initialEntries: [`/games/${gameId}`] }
  )
  render(<RouterProvider router={router} />)
}

describe('GameDetailsScreen', () => {
  it('shows the game as the main heading with its platform', () => {
    renderDetailsOf('mgs-ps1')

    expect(screen.getByRole('heading', { level: 1, name: 'Metal Gear Solid' })).toBeInTheDocument()
    expect(screen.getByText('PlayStation')).toBeInTheDocument()
  })

  it('shows the release year, genre and players in one line', () => {
    renderDetailsOf('mgs-ps1')

    expect(screen.getByText('1998 · Stealth action · 1 player')).toBeInTheDocument()
  })

  it('counts several players in the plural', () => {
    renderDetailsOf('dk-64')

    expect(screen.getByText('1999 · Platformer · 4 players')).toBeInTheDocument()
  })

  it('shows the description, when it was last played and the total playtime', () => {
    renderDetailsOf('mgs-ps1')

    expect(screen.getByText(/Infiltrate a nuclear weapons facility/)).toBeInTheDocument()
    expect(screen.getByText('Last played 3 days ago')).toBeInTheDocument()
    expect(screen.getByText('Total playtime: 18 h 40 min')).toBeInTheDocument()
  })

  it('focuses the Play action', () => {
    renderDetailsOf('mgs-ps1')

    expect(screen.getByRole('button', { name: 'Play' })).toHaveFocus()
  })

  it('treats the artwork as decorative', () => {
    renderDetailsOf('mgs-ps1')

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('says when the game is not in the library', () => {
    renderDetailsOf('unknown-game')

    expect(screen.getByText('This game is not in your library.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Play' })).not.toBeInTheDocument()
  })
})
