import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { NavigationProvider, SECTION_PATHS } from '@renderer/core/navigation'

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

  it('shows surprise me as not available yet', async () => {
    const router = renderReadyHero()

    const surprise = screen.getByRole('button', { name: 'Surprise me' })
    expect(surprise).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(surprise)

    expect(router.state.location.pathname).toBe(SECTION_PATHS.home)
  })

  it('treats the artwork as decorative', () => {
    renderReadyHero()

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
