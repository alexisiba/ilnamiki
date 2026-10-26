import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import type { Emulator, InstalledPlatform } from '@shared/api'

import {
  getRequestedSettingsCategory,
  NavigationProvider,
  SECTION_PATHS
} from '@renderer/core/navigation'

import { GameSetup } from './GameSetup'

const RETROARCH: Emulator = {
  id: '33b85b34-3541-4897-bd70-49ed7143fcfd',
  kind: 'retroarch',
  name: 'RetroArch',
  executablePath: '/home/player/Emulators/RetroArch-Linux-x86_64.AppImage',
  version: '1.22.2',
  iconDataUrl: null,
  addedAt: 1_800_000_000_000
}

const OTHER: Emulator = {
  ...RETROARCH,
  id: '5d0c2a1e-8f3b-4c6d-9e7a-1b2c3d4e5f60',
  kind: 'unknown',
  name: 'Other emulator',
  version: null
}

const platform = (id: string, name: string): InstalledPlatform => ({
  id,
  name,
  manufacturer: null,
  cores: [{ id: `${id}-core`, name: 'Core', emulatorId: RETROARCH.id, extensions: [] }],
  isEnabled: true,
  defaultCore: null
})

const PLATFORMS = [platform('nes', 'NES'), platform('snes', 'SNES')]

function renderGameSetup(
  emulators: Emulator[] = [RETROARCH]
): ReturnType<typeof createMemoryRouter> {
  const router = createMemoryRouter(
    [
      {
        path: SECTION_PATHS.home,
        element: (
          <NavigationProvider>
            <GameSetup emulators={emulators} platforms={PLATFORMS} />
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

const goToSettings = (): HTMLElement => screen.getByRole('button', { name: 'Go to Settings' })

describe('GameSetup', () => {
  it('says the emulator is ready and a folder of games is what is left', () => {
    renderGameSetup()

    expect(screen.getByRole('heading', { name: 'Add your games' })).toBeInTheDocument()
    expect(
      screen.getByText('Your emulator is ready. Add a folder with your games to start playing.')
    ).toBeInTheDocument()
  })

  it('lists each emulator with its version and how many consoles it plays', () => {
    renderGameSetup([RETROARCH, OTHER])

    const items = within(screen.getByRole('list', { name: 'Your emulators' })).getAllByRole(
      'listitem'
    )
    expect(items.map((item) => item.textContent)).toEqual([
      'RetroArch 1.22.22 consoles linked',
      'Other emulator0 consoles linked'
    ])
  })

  it('offers one action, focused: going to Settings, the list being no control', () => {
    renderGameSetup()

    expect(screen.getAllByRole('button')).toEqual([goToSettings()])
    expect(goToSettings()).toHaveFocus()
  })

  it('opens Settings on its game folders, without stacking history', async () => {
    const router = renderGameSetup()

    await userEvent.setup().click(goToSettings())

    expect(router.state.location.pathname).toBe(SECTION_PATHS.settings)
    expect(getRequestedSettingsCategory(router.state.location.state)).toBe('gameFolders')
    expect(router.state.historyAction).toBe('REPLACE')
  })
})
