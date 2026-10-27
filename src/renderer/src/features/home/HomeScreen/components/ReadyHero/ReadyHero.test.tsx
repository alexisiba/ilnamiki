import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { startBackgroundMusic } from '@renderer/core/audio'
import { NavigationProvider, SECTION_PATHS } from '@renderer/core/navigation'
import { emitGameEnded, mockLaunchRandomGame } from '@renderer/test/api'
import { isMusicPlaying } from '@renderer/test/audio'

import { ReadyHero } from './ReadyHero'
import type { ReadyHeroProps } from './ReadyHero.types'

const COUNTS: ReadyHeroProps = { gameCount: 24, emulatorCount: 2, platformCount: 5 }

function renderReadyHero(counts: ReadyHeroProps = COUNTS): ReturnType<typeof createMemoryRouter> {
  const router = createMemoryRouter(
    [
      {
        path: SECTION_PATHS.home,
        element: (
          <NavigationProvider>
            <ReadyHero {...counts} />
          </NavigationProvider>
        )
      },
      { path: SECTION_PATHS.library, element: <p>Library screen</p> }
    ],
    { initialEntries: [SECTION_PATHS.home] }
  )
  render(<RouterProvider router={router} />)
  return router
}

describe('ReadyHero', () => {
  it('shows how many games are ready to play as the main heading', () => {
    renderReadyHero()

    expect(
      screen.getByRole('heading', { level: 1, name: '24 games ready to play' })
    ).toBeInTheDocument()
    expect(screen.getByText('Ready to play')).toBeInTheDocument()
    expect(screen.getByText('Pick one or let Ilnamiki choose for you.')).toBeInTheDocument()
  })

  it('shows how many emulators and consoles play them', () => {
    renderReadyHero()

    expect(screen.getByText('2 emulators')).toBeInTheDocument()
    expect(screen.getByText('5 consoles')).toBeInTheDocument()
  })

  it('counts a single game, emulator and console in the singular', () => {
    renderReadyHero({ gameCount: 1, emulatorCount: 1, platformCount: 1 })

    expect(screen.getByRole('heading', { name: '1 game ready to play' })).toBeInTheDocument()
    expect(screen.getByText('1 emulator')).toBeInTheDocument()
    expect(screen.getByText('1 console')).toBeInTheDocument()
  })

  it('focuses exploring the library, which opens it', async () => {
    const router = renderReadyHero()

    const explore = screen.getByRole('button', { name: 'Explore library' })
    expect(explore).toHaveFocus()

    await userEvent.click(explore)

    expect(router.state.location.pathname).toBe(SECTION_PATHS.library)
    expect(screen.getByText('Library screen')).toBeInTheDocument()
  })

  it('starts a game picked at random with Surprise me, which reads Playing until it ends', async () => {
    mockLaunchRandomGame({ ok: true, gameId: 'g7' })
    startBackgroundMusic()
    const router = renderReadyHero()

    await userEvent.click(screen.getByRole('button', { name: 'Surprise me' }))

    expect(window.api.games.launchRandom).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Playing' })).toHaveAttribute('aria-disabled', 'true')
    expect(isMusicPlaying()).toBe(false)
    expect(router.state.location.pathname).toBe(SECTION_PATHS.home)

    // Only the end of the game it started counts.
    act(() => emitGameEnded('g1'))
    expect(screen.getByRole('button', { name: 'Playing' })).toBeInTheDocument()

    act(() => emitGameEnded('g7'))
    expect(screen.getByRole('button', { name: 'Surprise me' })).toHaveAttribute(
      'aria-disabled',
      'false'
    )
    expect(isMusicPlaying()).toBe(true)
  })

  it('starts one game while it is starting or being played', async () => {
    mockLaunchRandomGame('pending')
    renderReadyHero()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Surprise me' }))

    await user.click(screen.getByRole('button', { name: 'Playing' }))

    expect(window.api.games.launchRandom).toHaveBeenCalledOnce()
  })

  it('says why no game started, describing Surprise me', async () => {
    mockLaunchRandomGame({ ok: false, problem: 'no-games' })
    renderReadyHero()

    await userEvent.click(screen.getByRole('button', { name: 'Surprise me' }))

    const message =
      'No game of your library can be played now. Check your game folders in Settings.'
    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(screen.getByRole('button', { name: 'Surprise me' })).toHaveAccessibleDescription(message)
  })

  it('treats the artwork as decorative', () => {
    renderReadyHero()

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
