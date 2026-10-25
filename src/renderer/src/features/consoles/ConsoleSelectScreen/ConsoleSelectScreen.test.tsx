import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { getGameFoldersState } from '@renderer/core/ipc/gameFolders'
import { getPlatformsState } from '@renderer/core/ipc/platforms'
import { NavigationProvider, SECTION_PATHS } from '@renderer/core/navigation'
import { mockGameFolders, mockPlatforms } from '@renderer/test/api'

import { ConsoleSelectScreen } from './ConsoleSelectScreen'

function renderLibrary(): ReturnType<typeof createMemoryRouter> {
  const router = createMemoryRouter(
    [
      {
        path: SECTION_PATHS.library,
        element: (
          <NavigationProvider>
            <ConsoleSelectScreen />
          </NavigationProvider>
        )
      },
      { path: SECTION_PATHS.settings, element: <p>Settings screen</p> }
    ],
    { initialEntries: [SECTION_PATHS.library] }
  )
  render(<RouterProvider router={router} />)
  return router
}

/** Waits for the installed platforms and game folders, which the library reads when it opens. */
async function waitForData(): Promise<void> {
  await vi.waitFor(() => {
    expect(getPlatformsState().status).toBe('ready')
    expect(getGameFoldersState().status).toBe('ready')
  })
}

const emptyTitle = (): HTMLElement | null =>
  screen.queryByRole('heading', { level: 2, name: 'No consoles with games yet' })

describe('ConsoleSelectScreen', () => {
  it('shows the installed platforms with games as consoles', async () => {
    mockPlatforms([
      {
        id: 'playstation',
        name: 'PlayStation',
        manufacturer: 'Sony',
        cores: [{ id: 'swanstation', name: 'SwanStation', emulatorId: 'a1', extensions: [] }]
      }
    ])
    mockGameFolders([
      {
        id: 'f1',
        path: '/home/player/Games/PS1',
        platformId: 'playstation',
        gameCount: 24,
        isAvailable: true,
        addedAt: 1
      }
    ])
    renderLibrary()

    expect(await screen.findByRole('button', { name: 'PlayStation' })).toHaveAccessibleDescription(
      'Sony · 1994 24 games installed'
    )
    expect(emptyTitle()).not.toBeInTheDocument()
  })

  it('shows nothing until the platforms and folders are read, so the empty view never flashes', () => {
    vi.mocked(window.api.library.listFolders).mockReturnValue(new Promise(() => {}))
    renderLibrary()

    expect(emptyTitle()).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('says there are no consoles with games yet, and how to add them', async () => {
    renderLibrary()
    await waitForData()

    expect(emptyTitle()).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open Settings' })).toHaveFocus()
  })

  it('opens Settings from the empty view', async () => {
    const router = renderLibrary()
    await waitForData()

    await userEvent.setup().click(screen.getByRole('button', { name: 'Open Settings' }))

    expect(router.state.location.pathname).toBe(SECTION_PATHS.settings)
  })
})
