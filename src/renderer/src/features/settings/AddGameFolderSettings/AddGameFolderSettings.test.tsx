import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { InstalledPlatform } from '@shared/api'

import { getPlatformsState } from '@renderer/core/ipc/platforms'
import { ADD_GAME_FOLDER_PATH, NavigationProvider, SECTION_PATHS } from '@renderer/core/navigation'
import { mockPickedFolder, mockPlatforms } from '@renderer/test/api'

import { AddGameFolderSettings } from './AddGameFolderSettings'

const PLATFORMS: InstalledPlatform[] = [
  {
    id: 'nintendo_64',
    name: 'Nintendo 64',
    cores: [{ id: 'mupen64plus_next', name: 'Mupen64Plus-Next', emulatorId: 'a1', extensions: [] }]
  },
  {
    id: 'playstation',
    name: 'PlayStation',
    cores: [{ id: 'swanstation', name: 'SwanStation', emulatorId: 'a1', extensions: [] }]
  }
]

beforeEach(() => {
  mockPlatforms(PLATFORMS)
})

/** Renders the form and waits for the installed platforms, which it reads when it opens. */
async function renderAddGameFolder(): Promise<void> {
  const router = createMemoryRouter(
    [
      { path: SECTION_PATHS.settings, element: <p>Settings screen</p> },
      {
        path: ADD_GAME_FOLDER_PATH,
        element: (
          <NavigationProvider>
            <AddGameFolderSettings />
          </NavigationProvider>
        )
      }
    ],
    { initialEntries: [ADD_GAME_FOLDER_PATH] }
  )
  render(<RouterProvider router={router} />)
  await vi.waitFor(() => expect(getPlatformsState().status).toBe('ready'))
}

const pathField = (): HTMLElement => screen.getByRole('textbox', { name: 'Folder path' })
const browse = (): HTMLElement => screen.getByRole('button', { name: 'Choose the folder' })
const platformSelect = (): HTMLElement => screen.getByRole('button', { name: /^Platform / })
const addFolder = (): HTMLElement => screen.getByRole('button', { name: 'Add folder' })
const platformList = (): HTMLElement | null =>
  screen.queryByRole('dialog', { name: 'Select a platform' })

describe('AddGameFolderSettings', () => {
  it('shows the form title and that it is filled with a keyboard and mouse', async () => {
    await renderAddGameFolder()

    expect(screen.getByRole('heading', { level: 2, name: 'Add game folder' })).toBeInTheDocument()
    expect(
      screen.getByText("You'll need a keyboard and mouse to fill in this form.")
    ).toBeInTheDocument()
  })

  it('focuses the folder path first', async () => {
    await renderAddGameFolder()

    expect(pathField()).toHaveFocus()
  })

  it('fills the path with the folder chosen in the folder picker', async () => {
    mockPickedFolder('/home/player/Games/N64')
    await renderAddGameFolder()

    await userEvent.setup().click(browse())

    expect(pathField()).toHaveValue('/home/player/Games/N64')
  })

  it('asks for a platform until one is chosen', async () => {
    await renderAddGameFolder()

    expect(platformSelect()).toHaveAccessibleName('Platform Select a platform')
    expect(platformSelect()).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the list of installed platforms on the first one', async () => {
    await renderAddGameFolder()

    await userEvent.setup().click(platformSelect())

    expect(platformList()).toBeInTheDocument()
    expect(
      within(platformList()!).getByRole('heading', { name: 'Select a platform' })
    ).toBeInTheDocument()
    expect(platformSelect()).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Nintendo 64' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'PlayStation' })).toBeInTheDocument()
  })

  it('chooses a platform, closing the list and returning focus to the select', async () => {
    await renderAddGameFolder()
    const user = userEvent.setup()
    await user.click(platformSelect())

    await user.click(screen.getByRole('button', { name: 'PlayStation' }))

    expect(platformList()).not.toBeInTheDocument()
    expect(platformSelect()).toHaveAccessibleName('Platform PlayStation')
    expect(platformSelect()).toHaveFocus()
  })

  it('opens the list on the chosen platform, marked as current', async () => {
    await renderAddGameFolder()
    const user = userEvent.setup()
    await user.click(platformSelect())
    await user.click(screen.getByRole('button', { name: 'PlayStation' }))

    await user.click(platformSelect())

    expect(screen.getByRole('button', { name: 'PlayStation' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'PlayStation' })).toHaveAttribute(
      'aria-current',
      'true'
    )
    expect(screen.getByRole('button', { name: 'Nintendo 64' })).not.toHaveAttribute('aria-current')
  })

  it('closes the list without choosing on back', async () => {
    await renderAddGameFolder()
    const user = userEvent.setup()
    await user.click(platformSelect())

    await user.keyboard('{Escape}')

    expect(platformList()).not.toBeInTheDocument()
    expect(platformSelect()).toHaveAccessibleName('Platform Select a platform')
    expect(platformSelect()).toHaveFocus()
  })

  it('keeps Add folder unavailable until the path and platform are filled in', async () => {
    await renderAddGameFolder()
    const user = userEvent.setup()
    expect(addFolder()).toHaveAttribute('aria-disabled', 'true')

    await user.keyboard('/home/player/Games/N64')
    expect(addFolder()).toHaveAttribute('aria-disabled', 'true')

    await user.click(platformSelect())
    await user.click(screen.getByRole('button', { name: 'Nintendo 64' }))
    expect(addFolder()).toHaveAttribute('aria-disabled', 'false')
  })

  it('returns to Settings with Cancel', async () => {
    await renderAddGameFolder()

    await userEvent.setup().click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByText('Settings screen')).toBeInTheDocument()
  })
})
