import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { CONSOLE_GAMES_PATH, NavigationProvider } from '@renderer/core/navigation'

import { ConsoleGamesScreen } from './ConsoleGamesScreen'

function renderGamesOf(consoleId: string): void {
  const router = createMemoryRouter(
    [
      {
        path: CONSOLE_GAMES_PATH,
        element: (
          <NavigationProvider>
            <ConsoleGamesScreen />
          </NavigationProvider>
        )
      }
    ],
    { initialEntries: [`/library/${consoleId}`] }
  )
  render(<RouterProvider router={router} />)
}

const selectedGame = (): HTMLElement =>
  screen.getAllByRole('button').find((button) => button.getAttribute('aria-current') === 'true')!

const playNow = (): HTMLElement => screen.getByRole('button', { name: 'Play now' })

describe('ConsoleGamesScreen', () => {
  it('shows the console as the main heading with its games and release year', () => {
    renderGamesOf('playstation')

    expect(screen.getByRole('heading', { level: 1, name: 'PlayStation' })).toBeInTheDocument()
    expect(screen.getByText('7 games installed · 1994')).toBeInTheDocument()
  })

  it('selects the first game with its facts and details', () => {
    renderGamesOf('playstation')

    expect(selectedGame()).toHaveAccessibleName('The Legend of Zelda: Ocarina of Time')
    expect(screen.getByText('1998 · Action-adventure · 1 player')).toBeInTheDocument()
    expect(screen.getByText(/Travel through time as Link/)).toBeInTheDocument()
  })

  it('shows the selected game’s playtime and when it was last played', () => {
    renderGamesOf('playstation')

    expect(screen.getByText('Playtime')).toBeInTheDocument()
    expect(screen.getByText('32 h 15 min')).toBeInTheDocument()
    expect(screen.getByText('Last played')).toBeInTheDocument()
    expect(screen.getByText('2 days ago')).toBeInTheDocument()
  })

  it('focuses Play now, described by the selected game and its position', () => {
    renderGamesOf('playstation')

    expect(playNow()).toHaveFocus()
    expect(playNow()).toHaveAccessibleDescription('The Legend of Zelda: Ocarina of Time, 1 of 7')
  })

  it('selects the next game on right, keeping focus on Play now', async () => {
    renderGamesOf('playstation')

    await userEvent.setup().keyboard('{ArrowRight}')

    expect(selectedGame()).toHaveAccessibleName('Donkey Kong 64')
    expect(screen.getByText('1999 · Platformer · 4 players')).toBeInTheDocument()
    expect(playNow()).toHaveAccessibleDescription('Donkey Kong 64, 2 of 7')
    expect(playNow()).toHaveFocus()
  })

  it('stays on the first game on left and on the last game on right', async () => {
    renderGamesOf('playstation')
    const user = userEvent.setup()

    await user.keyboard('{ArrowLeft}')
    expect(selectedGame()).toHaveAccessibleName('The Legend of Zelda: Ocarina of Time')

    await user.keyboard('{ArrowRight}'.repeat(7))
    expect(selectedGame()).toHaveAccessibleName('Monster Hunter Freedom Unite')
    expect(playNow()).toHaveAccessibleDescription('Monster Hunter Freedom Unite, 7 of 7')
  })

  it('selects a game when it is clicked, keeping focus on Play now', async () => {
    renderGamesOf('playstation')

    await userEvent.setup().click(screen.getByRole('button', { name: 'Donkey Kong 64' }))

    expect(selectedGame()).toHaveAccessibleName('Donkey Kong 64')
    expect(playNow()).toHaveFocus()
  })

  it('shows a message for a console that is not in the library', () => {
    renderGamesOf('dreamcast')

    expect(screen.getByText('This console is not in your library.')).toBeInTheDocument()
  })
})
