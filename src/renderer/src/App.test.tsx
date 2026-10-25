import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockEmulators, mockFolderGames, mockGameFolders, mockPlatforms } from '@renderer/test/api'
import { connectGamepad } from '@renderer/test/gamepad'

import { APP_ROUTES } from './App.routes'

// One emulator, RetroArch, and one console in the library: the NES, with a folder of two games.
beforeEach(() => {
  mockEmulators([
    {
      id: 'a1',
      kind: 'retroarch',
      name: 'RetroArch',
      executablePath: '/home/player/Emulators/RetroArch-Linux-x86_64.AppImage',
      version: '1.22.2',
      iconDataUrl: null,
      addedAt: 1
    }
  ])
  mockFolderGames([
    { id: 'g1', title: 'Contra (USA)', filePath: '/home/player/Games/NES/Contra (USA).nes' },
    { id: 'g2', title: 'Metroid (USA)', filePath: '/home/player/Games/NES/Metroid (USA).nes' }
  ])
  mockPlatforms([
    {
      id: 'nes',
      name: 'Nintendo Entertainment System',
      manufacturer: 'Nintendo',
      cores: [{ id: 'mesen', name: 'Mesen', emulatorId: 'a1', extensions: ['nes'] }]
    }
  ])
  mockGameFolders([
    {
      id: 'f1',
      path: '/home/player/Games/NES',
      platformId: 'nes',
      gameCount: 56,
      isAvailable: true,
      addedAt: 1
    }
  ])
})

function renderApp(): ReturnType<typeof createMemoryRouter> {
  const router = createMemoryRouter(APP_ROUTES)
  render(<RouterProvider router={router} />)
  return router
}

function currentSection(): HTMLElement {
  return screen.getByRole('link', { current: 'page' })
}

describe('App', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('switches sections with the gamepad shoulder buttons', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })
    vi.spyOn(document, 'hasFocus').mockReturnValue(true)
    const gamepad = connectGamepad()
    const LB = 4
    const RB = 5
    renderApp()

    gamepad.press(RB)
    act(() => vi.advanceTimersToNextFrame())
    expect(currentSection()).toHaveTextContent('Library')

    gamepad.release(RB)
    gamepad.press(LB)
    act(() => vi.advanceTimersToNextFrame())
    expect(currentSection()).toHaveTextContent('Home')
  })

  it('starts on the home section', () => {
    renderApp()

    expect(currentSection()).toHaveTextContent('Home')
  })

  it('opens a section when its tab is clicked', async () => {
    renderApp()

    await userEvent.setup().click(screen.getByRole('link', { name: 'Library' }))

    expect(currentSection()).toHaveTextContent('Library')
    expect(screen.getByRole('heading', { level: 1, name: 'Library' })).toBeInTheDocument()
  })

  it('moves to the next section on nextSection', async () => {
    renderApp()

    await userEvent.setup().keyboard('e')

    expect(currentSection()).toHaveTextContent('Library')
  })

  it('wraps to the last section on prevSection from the first one', async () => {
    renderApp()

    await userEvent.setup().keyboard('q')

    expect(currentSection()).toHaveTextContent('Settings')
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument()
  })

  it('wraps to the first section on nextSection from the last one', async () => {
    renderApp()
    const user = userEvent.setup()

    await user.click(screen.getByRole('link', { name: 'Settings' }))
    await user.keyboard('e')

    expect(currentSection()).toHaveTextContent('Home')
  })

  it('switches sections with the on-screen shoulder hints', async () => {
    renderApp()
    const user = userEvent.setup()

    // The hints show keyboard keys until a gamepad is used.
    await user.click(screen.getByRole('button', { name: 'E' }))
    expect(currentSection()).toHaveTextContent('Library')

    await user.click(screen.getByRole('button', { name: 'Q' }))
    expect(currentSection()).toHaveTextContent('Home')
  })

  it('does not stack history when switching sections', async () => {
    const router = renderApp()
    const user = userEvent.setup()

    await user.click(screen.getByRole('link', { name: 'Library' }))
    await user.keyboard('e')
    await router.navigate(-1)

    expect(currentSection()).toHaveTextContent('Settings')
  })

  it('restores the focused game when coming back to home', async () => {
    renderApp()
    const user = userEvent.setup()
    const card = await screen.findByRole('button', { name: 'Donkey Kong 64' })

    await user.pointer({ target: card, coords: { x: 100, y: 500 } })
    await user.keyboard('ee')
    await user.keyboard('e')

    expect(screen.getByRole('button', { name: 'Donkey Kong 64' })).toHaveFocus()
  })

  it('opens a game’s details from its card, still inside the home section', async () => {
    renderApp()

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Donkey Kong 64' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Donkey Kong 64' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play' })).toHaveFocus()
    expect(currentSection()).toHaveTextContent('Home')
  })

  it('goes back from a game’s details to home, with focus on its card', async () => {
    renderApp()
    const user = userEvent.setup()
    const card = await screen.findByRole('button', { name: 'Donkey Kong 64' })

    await user.pointer({ target: card, coords: { x: 100, y: 500 } })
    await user.keyboard('{Enter}')
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('button', { name: 'Play' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Donkey Kong 64' })).toHaveFocus()
  })

  it('opens a console’s games from the library and goes back to it', async () => {
    const router = renderApp()
    const user = userEvent.setup()

    await user.click(screen.getByRole('link', { name: 'Library' }))
    await user.click(await screen.findByRole('button', { name: 'NES' }))
    await user.keyboard('{Enter}')

    expect(router.state.location.pathname).toBe('/library/nes')
    expect(screen.getByRole('heading', { level: 1, name: 'NES' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Play now' })).toHaveFocus()
    expect(currentSection()).toHaveTextContent('Library')

    await user.keyboard('{Escape}')

    expect(router.state.location.pathname).toBe('/library')
    expect(screen.getByRole('button', { name: 'NES' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'NES' })).toHaveAttribute('aria-current', 'true')
  })

  it('returns to the screen a section was left on, as it was left', async () => {
    const router = renderApp()
    const user = userEvent.setup()

    await user.click(screen.getByRole('link', { name: 'Library' }))
    await user.click(await screen.findByRole('button', { name: 'NES' }))
    await user.keyboard('{Enter}')
    await screen.findByRole('button', { name: 'Play now' })
    await user.keyboard('{ArrowRight}')
    await user.keyboard('q')
    expect(currentSection()).toHaveTextContent('Home')

    await user.keyboard('e')

    expect(router.state.location.pathname).toBe('/library/nes')
    expect(await screen.findByRole('button', { name: 'Metroid (USA)' })).toHaveAttribute(
      'aria-current',
      'true'
    )
    expect(screen.getByRole('button', { name: 'Play now' })).toHaveFocus()
  })

  it('returns to the screen a section was left on from its tab', async () => {
    const router = renderApp()
    const user = userEvent.setup()

    await user.click(screen.getByRole('link', { name: 'Library' }))
    await user.click(await screen.findByRole('button', { name: 'NES' }))
    await user.keyboard('{Enter}')
    await user.click(screen.getByRole('link', { name: 'Home' }))
    await user.click(screen.getByRole('link', { name: 'Library' }))

    expect(router.state.location.pathname).toBe('/library/nes')
  })

  it('goes back to the section’s root after visiting other sections', async () => {
    const router = renderApp()
    const user = userEvent.setup()

    await user.click(screen.getByRole('link', { name: 'Library' }))
    await user.click(await screen.findByRole('button', { name: 'NES' }))
    await user.keyboard('{Enter}')
    await user.click(await screen.findByRole('button', { name: 'Metroid (USA)' }))
    await user.keyboard('q')
    await user.click(screen.getByRole('button', { name: 'Donkey Kong 64' }))
    await user.keyboard('e{Escape}')

    expect(router.state.location.pathname).toBe('/library')
    expect(screen.getByRole('button', { name: 'NES' })).toHaveFocus()
  })

  it('keeps the screen behind search still: typing and back act on search only', async () => {
    const router = renderApp()
    const user = userEvent.setup()

    await user.click(screen.getByRole('link', { name: 'Library' }))
    await user.click(await screen.findByRole('button', { name: 'NES' }))
    await user.keyboard('{Enter}')
    await screen.findByRole('button', { name: 'Play now' })
    await user.keyboard('y')
    await user.keyboard('qe{ArrowRight}{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/library/nes')
    expect(screen.getByRole('button', { name: 'Play now' })).toHaveFocus()
  })

  it('goes back to the screen that opened a game, even in another section', async () => {
    const router = renderApp()
    const user = userEvent.setup()
    await user.click(screen.getByRole('link', { name: 'Library' }))
    await user.click(await screen.findByRole('button', { name: 'NES' }))
    await user.keyboard('{Enter}')

    // As search opens a game over the screen it was opened from.
    await act(() =>
      router.navigate('/games/dk-64', {
        state: { backTo: { pathname: '/library/nes', state: router.state.location.state } }
      })
    )
    await user.keyboard('{Escape}')

    expect(router.state.location.pathname).toBe('/library/nes')
    expect(currentSection()).toHaveTextContent('Library')

    // That screen still knows what opened it.
    await user.keyboard('{Escape}')

    expect(router.state.location.pathname).toBe('/library')
  })

  it('comes back from a screen inside Settings to the categories, on the button that opened it', async () => {
    renderApp()
    const user = userEvent.setup()
    await user.click(screen.getByRole('link', { name: 'Settings' }))
    await user.click(screen.getByRole('button', { name: 'Add emulator' }))
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add emulator' })).toHaveFocus()
  })

  it('opens the emulators in Settings from Home while there are none, whichever was left', async () => {
    mockEmulators([])
    const router = renderApp()
    const user = userEvent.setup()
    // Settings left on another category.
    await user.click(screen.getByRole('link', { name: 'Settings' }))
    await user.click(screen.getByRole('tab', { name: 'Game folders' }))
    await user.click(screen.getByRole('link', { name: 'Home' }))

    await user.click(await screen.findByRole('button', { name: 'Set up an emulator' }))

    expect(router.state.location.pathname).toBe('/settings')
    expect(screen.getByRole('tab', { name: 'Emulators' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Emulators' })).toHaveFocus()
  })

  it('stays on a section’s root on back', async () => {
    const router = renderApp()
    const user = userEvent.setup()

    await user.click(screen.getByRole('link', { name: 'Library' }))
    await user.keyboard('{Escape}')

    expect(router.state.location.pathname).toBe('/library')
  })
})
