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
  ],
  isEnabled: true,
  defaultCore: null
}

const PLAYSTATION: InstalledPlatform = {
  id: 'playstation',
  name: 'PlayStation',
  manufacturer: null,
  cores: [{ id: 'swanstation', name: 'SwanStation', emulatorId: 'a1', extensions: [] }],
  isEnabled: false,
  defaultCore: null
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

  it('names its only core, with nothing to pick', async () => {
    mockPlatforms([PLAYSTATION])
    renderDetails(PLAYSTATION.id)
    await screen.findByRole('heading', { level: 2 })

    expect(within(section('Core')).getByText('SwanStation')).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
  })

  it('offers its cores to pick the default from, saying which games it applies to', async () => {
    mockPlatforms([SUPER_NES])
    renderDetails()

    const cores = await screen.findByRole('radiogroup', { name: 'Default core' })
    expect(
      within(cores)
        .getAllByRole('radio')
        .map((core) => core.textContent)
    ).toEqual(['bsnes', 'Snes9x'])
    expect(cores).toHaveAccessibleDescription(
      "Games of this platform you haven't played yet, and those you add later, play with the core you pick. Games you've already played keep theirs."
    )
  })

  it('marks the first core while none was picked', async () => {
    mockPlatforms([SUPER_NES])
    renderDetails()

    expect(await screen.findByRole('radio', { name: 'bsnes' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Snes9x' })).not.toBeChecked()
  })

  it('marks the core picked as the default', async () => {
    mockPlatforms([{ ...SUPER_NES, defaultCore: { emulatorId: 'a1', coreId: 'snes9x' } }])
    renderDetails()

    expect(await screen.findByRole('radio', { name: 'Snes9x' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'bsnes' })).not.toBeChecked()
  })

  it('keeps the core picked as the default in main, marking it', async () => {
    mockPlatforms([SUPER_NES])
    renderDetails()
    const snes9x = await screen.findByRole('radio', { name: 'Snes9x' })

    await userEvent.setup().click(snes9x)

    expect(window.api.platforms.setDefaultCore).toHaveBeenCalledWith('super_nes', {
      emulatorId: 'a1',
      coreId: 'snes9x'
    })
    expect(snes9x).toBeChecked()
    expect(screen.getByRole('radio', { name: 'bsnes' })).not.toBeChecked()
  })

  it('keeps the mark where it was when the core can’t be kept, saying so', async () => {
    mockPlatforms([SUPER_NES])
    vi.mocked(window.api.platforms.setDefaultCore).mockRejectedValue(new Error('No database'))
    renderDetails()

    await userEvent.setup().click(await screen.findByRole('radio', { name: 'Snes9x' }))

    const message = "The core couldn't be saved. Try again."
    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(screen.getByRole('radio', { name: 'bsnes' })).toBeChecked()
    expect(screen.getByRole('radiogroup')).toHaveAccessibleDescription(
      expect.stringContaining(message)
    )
  })

  it('leaves the maker out when no core says it', async () => {
    mockPlatforms([PLAYSTATION])
    renderDetails(PLAYSTATION.id)

    expect(
      await screen.findByRole('heading', { level: 2, name: 'PlayStation' })
    ).toBeInTheDocument()
    expect(screen.queryByText('Sony')).not.toBeInTheDocument()
  })

  it('focuses the switch, on while the platform is on, saying what off means', async () => {
    mockPlatforms([SUPER_NES])
    renderDetails()

    const enabled = await screen.findByRole('switch', { name: 'Platform on' })
    expect(enabled).toHaveFocus()
    expect(enabled).toBeChecked()
    expect(enabled).toHaveAccessibleDescription(
      "While it is off, its games don't show in your library or on Home. Nothing is deleted."
    )
  })

  it('shows the switch off while the platform is off', async () => {
    mockPlatforms([PLAYSTATION])
    renderDetails(PLAYSTATION.id)

    expect(await screen.findByRole('switch', { name: 'Platform on' })).not.toBeChecked()
  })

  it('turns the platform off and on again, keeping it in main', async () => {
    mockPlatforms([SUPER_NES])
    renderDetails()
    const user = userEvent.setup()
    const enabled = await screen.findByRole('switch', { name: 'Platform on' })

    await user.click(enabled)

    expect(window.api.platforms.setEnabled).toHaveBeenLastCalledWith('super_nes', false)
    expect(enabled).not.toBeChecked()

    await user.click(enabled)

    expect(window.api.platforms.setEnabled).toHaveBeenLastCalledWith('super_nes', true)
    expect(enabled).toBeChecked()
  })

  it('keeps the switch as it was when the change can’t be kept, saying so', async () => {
    mockPlatforms([SUPER_NES])
    vi.mocked(window.api.platforms.setEnabled).mockRejectedValue(new Error('No database'))
    renderDetails()
    const enabled = await screen.findByRole('switch', { name: 'Platform on' })

    await userEvent.setup().click(enabled)

    const message = "The change couldn't be saved. Try again."
    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(enabled).toBeChecked()
    expect(enabled).toHaveAccessibleDescription(expect.stringContaining(message))
  })

  it('returns to the list with Back', async () => {
    mockPlatforms([SUPER_NES])
    renderDetails()

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Back' }))

    expect(screen.getByText('Settings screen')).toBeInTheDocument()
  })

  it('says so when the platform is no longer installed, with Back', async () => {
    mockPlatforms([PLAYSTATION])
    renderDetails()

    expect(
      await screen.findByRole('heading', { name: 'This platform is no longer installed.' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toHaveFocus()
  })

  it('shows nothing until the platforms are read', () => {
    vi.mocked(window.api.platforms.list).mockReturnValue(new Promise(() => {}))
    renderDetails()

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
