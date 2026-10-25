import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import {
  getRequestedSettingsCategory,
  NavigationProvider,
  SECTION_PATHS
} from '@renderer/core/navigation'

import { EmulatorSetup } from './EmulatorSetup'

function renderEmulatorSetup(): ReturnType<typeof createMemoryRouter> {
  const router = createMemoryRouter(
    [
      {
        path: SECTION_PATHS.home,
        element: (
          <NavigationProvider>
            <EmulatorSetup />
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

const setUp = (): HTMLElement => screen.getByRole('button', { name: 'Set up an emulator' })

describe('EmulatorSetup', () => {
  it('says an emulator is needed, recommending RetroArch', () => {
    renderEmulatorSetup()

    expect(screen.getByRole('heading', { name: 'Set up your first emulator' })).toBeInTheDocument()
    expect(screen.getByText(/We recommend RetroArch/)).toBeInTheDocument()
  })

  it('offers one action, focused: setting up an emulator', () => {
    renderEmulatorSetup()

    expect(screen.getAllByRole('button')).toEqual([setUp()])
    expect(setUp()).toHaveFocus()
  })

  it('opens Settings on its emulators, without stacking history', async () => {
    const router = renderEmulatorSetup()

    await userEvent.setup().click(setUp())

    expect(router.state.location.pathname).toBe(SECTION_PATHS.settings)
    expect(getRequestedSettingsCategory(router.state.location.state)).toBe('emulators')
    expect(router.state.historyAction).toBe('REPLACE')
  })
})
