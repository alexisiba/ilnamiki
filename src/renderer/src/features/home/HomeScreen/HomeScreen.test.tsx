import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import type { Emulator, InstalledPlatform } from '@shared/api'

import { NavigationProvider, SECTION_PATHS } from '@renderer/core/navigation'
import { mockEmulators, mockPlatforms } from '@renderer/test/api'

import { HomeScreen } from './HomeScreen'

const RETROARCH: Emulator = {
  id: '33b85b34-3541-4897-bd70-49ed7143fcfd',
  kind: 'retroarch',
  name: 'RetroArch',
  executablePath: '/home/player/Emulators/RetroArch-Linux-x86_64.AppImage',
  version: '1.22.2',
  iconDataUrl: null,
  addedAt: 1_800_000_000_000
}

function renderHome(): void {
  const router = createMemoryRouter(
    [
      {
        path: SECTION_PATHS.home,
        element: (
          <NavigationProvider>
            <HomeScreen />
          </NavigationProvider>
        )
      }
    ],
    { initialEntries: [SECTION_PATHS.home] }
  )
  render(<RouterProvider router={router} />)
}

const NINTENDO_64: InstalledPlatform = {
  id: 'nintendo_64',
  name: 'Nintendo 64',
  manufacturer: 'Nintendo',
  cores: [
    { id: 'mupen64plus_next', name: 'Mupen64Plus-Next', emulatorId: RETROARCH.id, extensions: [] }
  ]
}

const setUpTitle = (): Promise<HTMLElement> =>
  screen.findByRole('heading', { name: 'Set up your first emulator' })

const platformSetUpTitle = (): Promise<HTMLElement> =>
  screen.findByRole('heading', { name: 'Your emulator has no consoles yet' })

describe('HomeScreen', () => {
  it('offers to set up the first emulator while the user has none', async () => {
    renderHome()

    expect(await setUpTitle()).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Set up an emulator' })).toHaveFocus()
  })

  it('offers to set up the emulator while it plays no console yet', async () => {
    mockEmulators([RETROARCH])
    renderHome()

    expect(await platformSetUpTitle()).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to emulator settings' })).toHaveFocus()
    expect(
      screen.queryByRole('heading', { name: 'Set up your first emulator' })
    ).not.toBeInTheDocument()
  })

  it('shows the last played game once the emulator plays a console', async () => {
    mockEmulators([RETROARCH])
    mockPlatforms([NINTENDO_64])
    renderHome()

    expect(await screen.findByRole('button', { name: 'Continue playing' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /no consoles yet/ })).not.toBeInTheDocument()
  })

  it('shows nothing until the emulators are read, so no view flashes', () => {
    vi.mocked(window.api.emulators.list).mockReturnValue(new Promise(() => {}))
    renderHome()

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows nothing until the platforms are read, so no view flashes', async () => {
    mockEmulators([RETROARCH])
    vi.mocked(window.api.platforms.list).mockReturnValue(new Promise(() => {}))
    renderHome()

    await vi.waitFor(() => expect(window.api.emulators.list).toHaveBeenCalled())
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
