import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import {
  getRequestedSettingsCategory,
  NavigationProvider,
  SECTION_PATHS
} from '@renderer/core/navigation'

import { PlatformSetup } from './PlatformSetup'

function renderPlatformSetup(): ReturnType<typeof createMemoryRouter> {
  const router = createMemoryRouter(
    [
      {
        path: SECTION_PATHS.home,
        element: (
          <NavigationProvider>
            <PlatformSetup />
          </NavigationProvider>
        )
      },
      { path: SECTION_PATHS.settings, element: <p>Settings screen</p> }
    ],
    { initialEntries: [SECTION_PATHS.home] }
  )
  render(<RouterProvider router={router} />)
  return router
}

const goToSettings = (): HTMLElement =>
  screen.getByRole('button', { name: 'Go to emulator settings' })

describe('PlatformSetup', () => {
  it('says the emulator can’t play any console yet', () => {
    renderPlatformSetup()

    expect(
      screen.getByRole('heading', { name: 'Your emulator has no consoles yet' })
    ).toBeInTheDocument()
    expect(screen.getByText(/by installing their cores/)).toBeInTheDocument()
  })

  it('offers one action, focused: going to the emulator settings', () => {
    renderPlatformSetup()

    expect(screen.getAllByRole('button')).toEqual([goToSettings()])
    expect(goToSettings()).toHaveFocus()
  })

  it('opens Settings on its emulators, without stacking history', async () => {
    const router = renderPlatformSetup()

    await userEvent.setup().click(goToSettings())

    expect(router.state.location.pathname).toBe(SECTION_PATHS.settings)
    expect(getRequestedSettingsCategory(router.state.location.state)).toBe('emulators')
    expect(router.state.historyAction).toBe('REPLACE')
  })
})
