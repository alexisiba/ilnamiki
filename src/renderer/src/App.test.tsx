import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { connectGamepad } from '@renderer/test/gamepad'

import { APP_ROUTES } from './App.routes'

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
    const card = screen.getByRole('button', { name: 'Donkey Kong 64' })

    await user.pointer({ target: card, coords: { x: 100, y: 500 } })
    await user.keyboard('ee')
    await user.keyboard('e')

    expect(screen.getByRole('button', { name: 'Donkey Kong 64' })).toHaveFocus()
  })

  it('opens a game’s details from its card, still inside the home section', async () => {
    renderApp()

    await userEvent.setup().click(screen.getByRole('button', { name: 'Donkey Kong 64' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Donkey Kong 64' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play' })).toHaveFocus()
    expect(currentSection()).toHaveTextContent('Home')
  })

  it('goes back from a game’s details to home, with focus on its card', async () => {
    renderApp()
    const user = userEvent.setup()
    const card = screen.getByRole('button', { name: 'Donkey Kong 64' })

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
    await user.click(screen.getByRole('button', { name: 'NES' }))
    await user.keyboard('{Enter}')

    expect(router.state.location.pathname).toBe('/library/nes')
    expect(screen.getByRole('heading', { level: 1, name: 'NES' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play now' })).toHaveFocus()
    expect(currentSection()).toHaveTextContent('Library')

    await user.keyboard('{Escape}')

    expect(router.state.location.pathname).toBe('/library')
    expect(screen.getByRole('button', { name: 'NES' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'NES' })).toHaveAttribute('aria-current', 'true')
  })

  it('stays on a section’s root on back', async () => {
    const router = renderApp()
    const user = userEvent.setup()

    await user.click(screen.getByRole('link', { name: 'Library' }))
    await user.keyboard('{Escape}')

    expect(router.state.location.pathname).toBe('/library')
  })
})
