import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import type { InstalledPlatform } from '@shared/api'

import {
  getPlatformDetailsPath,
  NavigationProvider,
  PLATFORM_DETAILS_PATH,
  SECTION_PATHS
} from '@renderer/core/navigation'
import { mockPlatforms } from '@renderer/test/api'

import { PlatformDetailsSettings } from './PlatformDetailsSettings'

const SUPER_NES: InstalledPlatform = {
  id: 'super_nes',
  name: 'Super Nintendo',
  manufacturer: 'Nintendo',
  cores: [
    { id: 'bsnes', name: 'bsnes', emulatorId: 'a1', extensions: ['sfc', 'bs'] },
    { id: 'snes9x', name: 'Snes9x', emulatorId: 'a1', extensions: ['smc', 'sfc'] }
  ]
}

const PLAYSTATION: InstalledPlatform = {
  id: 'playstation',
  name: 'PlayStation',
  manufacturer: null,
  cores: [{ id: 'swanstation', name: 'SwanStation', emulatorId: 'a1', extensions: [] }]
}

function renderDetails(platformId: string = SUPER_NES.id): void {
  const router = createMemoryRouter(
    [
      { path: SECTION_PATHS.settings, element: <p>Settings screen</p> },
      {
        path: PLATFORM_DETAILS_PATH,
        element: (
          <NavigationProvider>
            <PlatformDetailsSettings />
          </NavigationProvider>
        )
      }
    ],
    { initialEntries: [SECTION_PATHS.settings, getPlatformDetailsPath(platformId)] }
  )
  render(<RouterProvider router={router} />)
}

const section = (name: string): HTMLElement => screen.getByRole('region', { name })

describe('PlatformDetailsSettings', () => {
  it('shows the platform’s name as its title and its maker below', async () => {
    mockPlatforms([SUPER_NES])
    renderDetails()

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Super Nintendo' })
    ).toBeInTheDocument()
    expect(screen.getByText('Nintendo')).toBeInTheDocument()
  })

  it('lists the extensions its cores play, once each', async () => {
    mockPlatforms([SUPER_NES])
    renderDetails()
    await screen.findByRole('heading', { level: 2 })

    const extensions = within(section('Extensions')).getAllByRole('listitem')
    expect(extensions.map((item) => item.textContent)).toEqual(['sfc', 'bs', 'smc'])
  })

  it('says so when its cores don’t declare their extensions', async () => {
    mockPlatforms([PLAYSTATION])
    renderDetails(PLAYSTATION.id)
    await screen.findByRole('heading', { level: 2 })

    expect(
      within(section('Extensions')).getByText("Its cores don't say which extensions they play.")
    ).toBeInTheDocument()
    expect(within(section('Extensions')).queryByRole('list')).not.toBeInTheDocument()
  })

  it('lists the cores that play it', async () => {
    mockPlatforms([SUPER_NES])
    renderDetails()
    await screen.findByRole('heading', { level: 2 })

    const cores = within(section('Cores')).getAllByRole('listitem')
    expect(cores.map((item) => item.textContent)).toEqual(['bsnes', 'Snes9x'])
  })

  it('leaves the maker out when no core says it', async () => {
    mockPlatforms([PLAYSTATION])
    renderDetails(PLAYSTATION.id)

    expect(
      await screen.findByRole('heading', { level: 2, name: 'PlayStation' })
    ).toBeInTheDocument()
    expect(screen.queryByText('Sony')).not.toBeInTheDocument()
  })

  it('focuses Back, which returns to the list', async () => {
    mockPlatforms([SUPER_NES])
    renderDetails()

    const back = await screen.findByRole('button', { name: 'Back' })
    expect(back).toHaveFocus()

    await userEvent.setup().click(back)

    expect(screen.getByText('Settings screen')).toBeInTheDocument()
  })

  it('says so when the platform is no longer installed, with Back', async () => {
    mockPlatforms([PLAYSTATION])
    renderDetails()

    expect(
      await screen.findByRole('heading', { name: 'This platform is no longer installed.' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
  })

  it('shows nothing until the platforms are read', () => {
    vi.mocked(window.api.platforms.list).mockReturnValue(new Promise(() => {}))
    renderDetails()

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
