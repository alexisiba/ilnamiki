import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { FolderScan, GameFolder, InstalledPlatform } from '@shared/api'

import { APP_ROUTES } from '@renderer/App.routes'
import { getGameFoldersState } from '@renderer/core/ipc/gameFolders'
import { getPlatformsState } from '@renderer/core/ipc/platforms'
import { ADD_GAME_FOLDER_PATH, NavigationProvider, SECTION_PATHS } from '@renderer/core/navigation'
import {
  emitScanProgress,
  mockAddGameFolder,
  mockGameFolders,
  mockPickedFolder,
  mockPlatforms,
  mockScanFolder
} from '@renderer/test/api'

import { AddGameFolderSettings } from './AddGameFolderSettings'

const PLATFORMS: InstalledPlatform[] = [
  {
    id: 'nintendo_64',
    name: 'Nintendo 64',
    manufacturer: 'Nintendo',
    cores: [{ id: 'mupen64plus_next', name: 'Mupen64Plus-Next', emulatorId: 'a1', extensions: [] }],
    isEnabled: true
  },
  {
    id: 'playstation',
    name: 'PlayStation',
    manufacturer: 'Sony',
    cores: [{ id: 'swanstation', name: 'SwanStation', emulatorId: 'a1', extensions: [] }],
    isEnabled: true
  }
]

const PS1_PATH = '/home/player/Games/PS1'

const SCAN: FolderScan = {
  id: '0b6c7b5e-3f43-4c1e-9d2a-6f0e8a1b2c3d',
  path: PS1_PATH,
  platformId: 'playstation',
  games: [
    { title: 'Crash Bandicoot (USA)', relativePath: 'Crash/Crash.cue', problem: null },
    {
      title: 'Wipeout XL (USA)',
      relativePath: 'Wipeout XL (USA).cue',
      problem: { kind: 'missing-files', files: ['Wipeout XL (USA) (Track 2).bin'] }
    },
    { title: 'Tekken 3 (USA)', relativePath: 'Tekken 3 (USA).chd', problem: null }
  ]
}

const PS1_FOLDER: GameFolder = {
  id: 'f1',
  path: PS1_PATH,
  platformId: 'playstation',
  gameCount: 2,
  isAvailable: true,
  addedAt: 1
}

beforeEach(() => {
  mockPlatforms(PLATFORMS)
})

/** Waits for the installed platforms and game folders, which the form reads when it opens. */
async function waitForData(): Promise<void> {
  await vi.waitFor(() => {
    expect(getPlatformsState().status).toBe('ready')
    expect(getGameFoldersState().status).toBe('ready')
  })
}

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
  await waitForData()
}

const pathField = (): HTMLElement => screen.getByRole('textbox', { name: 'Folder path' })
const browse = (): HTMLElement => screen.getByRole('button', { name: 'Choose the folder' })
const platformSelect = (): HTMLElement => screen.getByRole('button', { name: /^Platform / })
const scanButton = (): HTMLElement => screen.getByRole('button', { name: 'Scan' })
const saveFolder = (): HTMLElement => screen.getByRole('button', { name: 'Save folder' })
const backButton = (): HTMLElement => screen.getByRole('button', { name: 'Back' })
const platformList = (): HTMLElement | null =>
  screen.queryByRole('dialog', { name: 'Select a platform' })

/** Fills the form in for PlayStation's folder and scans it. */
async function scanPs1Folder(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(pathField())
  await user.keyboard(PS1_PATH)
  await user.click(platformSelect())
  await user.click(screen.getByRole('button', { name: 'PlayStation' }))
  await user.click(scanButton())
}

describe('AddGameFolderSettings', () => {
  describe('the form', () => {
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

    it('asks for a platform until one is chosen, saying each platform has one folder', async () => {
      await renderAddGameFolder()

      expect(platformSelect()).toHaveAccessibleName('Platform Select a platform')
      expect(platformSelect()).toHaveAccessibleDescription(
        "Each platform can have one folder. Platforms that already have one aren't listed."
      )
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

    it('leaves out the platforms that already have a folder', async () => {
      mockGameFolders([PS1_FOLDER])
      await renderAddGameFolder()

      await userEvent.setup().click(platformSelect())

      expect(screen.getByRole('button', { name: 'Nintendo 64' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'PlayStation' })).not.toBeInTheDocument()
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
      expect(screen.getByRole('button', { name: 'Nintendo 64' })).not.toHaveAttribute(
        'aria-current'
      )
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

    it('keeps Scan unavailable until the path and platform are filled in', async () => {
      await renderAddGameFolder()
      const user = userEvent.setup()
      expect(scanButton()).toHaveAttribute('aria-disabled', 'true')

      await user.keyboard('/home/player/Games/N64')
      expect(scanButton()).toHaveAttribute('aria-disabled', 'true')

      await user.click(platformSelect())
      await user.click(screen.getByRole('button', { name: 'Nintendo 64' }))
      expect(scanButton()).toHaveAttribute('aria-disabled', 'false')
    })

    it('asks for the full path instead of scanning one that isn’t absolute', async () => {
      await renderAddGameFolder()
      const user = userEvent.setup()
      await user.keyboard('Games/N64')
      await user.click(platformSelect())
      await user.click(screen.getByRole('button', { name: 'Nintendo 64' }))

      await user.click(scanButton())

      expect(screen.getByRole('alert')).toHaveTextContent(
        "Write the folder's full path, from the root."
      )
      expect(window.api.library.scanFolder).not.toHaveBeenCalled()
    })

    it('returns to Settings with Cancel', async () => {
      await renderAddGameFolder()

      await userEvent.setup().click(screen.getByRole('button', { name: 'Cancel' }))

      expect(screen.getByText('Settings screen')).toBeInTheDocument()
    })
  })

  describe('the scan', () => {
    it('scans the folder for the platform, showing its progress', async () => {
      mockScanFolder('pending')
      await renderAddGameFolder()

      await scanPs1Folder(userEvent.setup())
      act(() => emitScanProgress(42))

      expect(window.api.library.scanFolder).toHaveBeenCalledWith({
        path: PS1_PATH,
        platformId: 'playstation'
      })
      expect(screen.getByRole('heading', { name: 'Scanning folder' })).toBeInTheDocument()
      expect(screen.getByText(`${PS1_PATH} · PlayStation`)).toBeInTheDocument()
      expect(screen.getByRole('progressbar', { name: 'Scanning folder' })).toHaveValue(42)
      expect(saveFolder()).toHaveAttribute('aria-disabled', 'true')
    })

    it('lists the games found, marking the damaged ones with why', async () => {
      mockScanFolder({ ok: true, scan: SCAN })
      await renderAddGameFolder()

      await scanPs1Folder(userEvent.setup())

      expect(await screen.findByRole('heading', { name: 'Games found' })).toBeInTheDocument()
      expect(screen.getByRole('status')).toHaveTextContent('2 games · 1 damaged')
      expect(screen.getAllByRole('listitem')).toHaveLength(3)
      expect(screen.getByRole('button', { name: 'Wipeout XL (USA)' })).toHaveAccessibleDescription(
        'Missing “Wipeout XL (USA) (Track 2).bin”. Check that the file is in the folder.'
      )
      expect(
        screen.getByRole('button', { name: 'Crash Bandicoot (USA)' })
      ).not.toHaveAccessibleDescription()
      expect(saveFolder()).toHaveAttribute('aria-disabled', 'false')
    })

    it('can’t save a folder without games, and says so', async () => {
      mockScanFolder({ ok: true, scan: { ...SCAN, games: [] } })
      await renderAddGameFolder()

      await scanPs1Folder(userEvent.setup())

      expect(await screen.findByRole('status')).toHaveTextContent(
        'No games available in this folder.'
      )
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
      expect(saveFolder()).toHaveAttribute('aria-disabled', 'true')
    })

    it('can’t save a folder whose games are all damaged, and says so', async () => {
      mockScanFolder({ ok: true, scan: { ...SCAN, games: [SCAN.games[1]] } })
      await renderAddGameFolder()

      await scanPs1Folder(userEvent.setup())

      expect(await screen.findByRole('status')).toHaveTextContent(
        '1 damagedNo playable games in this folder.'
      )
      expect(saveFolder()).toHaveAttribute('aria-disabled', 'true')
    })

    it('returns to the form as it was with Back, cancelling the scan', async () => {
      mockScanFolder('pending')
      await renderAddGameFolder()
      const user = userEvent.setup()
      await scanPs1Folder(user)

      await user.click(backButton())

      expect(window.api.library.cancelScan).toHaveBeenCalledOnce()
      expect(pathField()).toHaveValue(PS1_PATH)
      expect(platformSelect()).toHaveAccessibleName('Platform PlayStation')
    })

    it('returns to the form saying why when the folder can’t be scanned', async () => {
      mockScanFolder({ ok: false, problem: 'not-found' })
      await renderAddGameFolder()

      await scanPs1Folder(userEvent.setup())

      expect(await screen.findByRole('alert')).toHaveTextContent("There's no folder at this path.")
      expect(pathField()).toHaveValue(PS1_PATH)
      expect(pathField()).toHaveAccessibleDescription("There's no folder at this path.")
    })

    it('returns to the form when the scan fails to reach main', async () => {
      mockScanFolder(new Error('No main'))
      await renderAddGameFolder()

      await scanPs1Folder(userEvent.setup())

      expect(await screen.findByRole('alert')).toHaveTextContent(
        "The folder couldn't be scanned. Try again."
      )
    })

    it('saves the folder and returns to Settings', async () => {
      mockScanFolder({ ok: true, scan: SCAN })
      mockAddGameFolder({ ok: true, folder: PS1_FOLDER })
      await renderAddGameFolder()
      const user = userEvent.setup()
      await scanPs1Folder(user)
      await screen.findByRole('heading', { name: 'Games found' })

      await user.click(saveFolder())

      expect(window.api.library.addFolder).toHaveBeenCalledWith(SCAN.id)
      expect(await screen.findByText('Settings screen')).toBeInTheDocument()
    })

    it('says why the folder couldn’t be saved, staying on the results', async () => {
      mockScanFolder({ ok: true, scan: SCAN })
      mockAddGameFolder({ ok: false, problem: 'unknown-scan' })
      await renderAddGameFolder()
      const user = userEvent.setup()
      await scanPs1Folder(user)
      await screen.findByRole('heading', { name: 'Games found' })

      await user.click(saveFolder())

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'This scan is no longer valid. Go back and scan the folder again.'
      )
      expect(screen.getByRole('heading', { name: 'Games found' })).toBeInTheDocument()
    })
  })

  it('returns from the results to the form on the back action, as a step back', async () => {
    mockScanFolder({ ok: true, scan: SCAN })
    const router = createMemoryRouter(APP_ROUTES, { initialEntries: [ADD_GAME_FOLDER_PATH] })
    render(<RouterProvider router={router} />)
    await waitForData()
    const user = userEvent.setup()
    await scanPs1Folder(user)
    await screen.findByRole('heading', { name: 'Games found' })

    await user.keyboard('{Escape}')

    expect(router.state.location.pathname).toBe(ADD_GAME_FOLDER_PATH)
    expect(pathField()).toHaveValue(PS1_PATH)

    await user.keyboard('{Escape}')

    expect(router.state.location.pathname).toBe(SECTION_PATHS.settings)
  })
})
