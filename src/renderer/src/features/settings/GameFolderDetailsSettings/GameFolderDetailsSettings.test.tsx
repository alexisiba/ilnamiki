import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import type { FolderGame, FolderScan, GameFolder, InstalledPlatform } from '@shared/api'

import { APP_ROUTES } from '@renderer/App.routes'
import {
  GAME_FOLDER_DETAILS_PATH,
  getGameFolderDetailsPath,
  NavigationProvider,
  SECTION_PATHS
} from '@renderer/core/navigation'
import {
  emitScanProgress,
  mockFolderGames,
  mockGameFolders,
  mockPlatforms,
  mockRescanFolder,
  mockUpdateGameFolder
} from '@renderer/test/api'

import { GameFolderDetailsSettings } from './GameFolderDetailsSettings'

const PLAYSTATION: InstalledPlatform = {
  id: 'playstation',
  name: 'PlayStation',
  manufacturer: 'Sony',
  cores: [{ id: 'swanstation', name: 'SwanStation', emulatorId: 'a1', extensions: [] }]
}

const PS1_PATH = '/home/player/Games/PS1'

const PS1_FOLDER: GameFolder = {
  id: 'f1',
  path: PS1_PATH,
  platformId: 'playstation',
  gameCount: 2,
  isAvailable: true,
  addedAt: 1
}

const GAMES: FolderGame[] = [
  { id: 'g1', title: 'Crash Bandicoot (USA)', filePath: `${PS1_PATH}/Crash/Crash.cue` },
  { id: 'g2', title: 'Tekken 3 (USA)', filePath: `${PS1_PATH}/Tekken 3 (USA).chd` }
]

const RESCAN: FolderScan = {
  id: '0b6c7b5e-3f43-4c1e-9d2a-6f0e8a1b2c3d',
  path: PS1_PATH,
  platformId: 'playstation',
  games: [
    { title: 'Ape Escape (USA)', relativePath: 'Ape Escape (USA).chd', problem: null },
    { title: 'Crash Bandicoot (USA)', relativePath: 'Crash/Crash.cue', problem: null },
    {
      title: 'Wipeout XL (USA)',
      relativePath: 'Wipeout XL (USA).cue',
      problem: { kind: 'missing-files', files: ['Wipeout XL (USA) (Track 2).bin'] }
    }
  ]
}

beforeEach(() => {
  mockPlatforms([PLAYSTATION])
  mockGameFolders([PS1_FOLDER])
  mockFolderGames(GAMES)
})

function renderDetails(folderId: string = PS1_FOLDER.id): void {
  const router = createMemoryRouter(
    [
      { path: SECTION_PATHS.settings, element: <p>Settings screen</p> },
      {
        path: GAME_FOLDER_DETAILS_PATH,
        element: (
          <NavigationProvider>
            <GameFolderDetailsSettings />
          </NavigationProvider>
        )
      }
    ],
    { initialEntries: [getGameFolderDetailsPath(folderId)] }
  )
  render(<RouterProvider router={router} />)
}

const rescan = (): HTMLElement => screen.getByRole('button', { name: 'Scan again' })
const saveChanges = (): HTMLElement => screen.getByRole('button', { name: 'Save changes' })
const gamesList = (): HTMLElement => screen.getByRole('region', { name: 'Games' })

describe('GameFolderDetailsSettings', () => {
  it('shows the folder’s platform as its title and how many games it has', async () => {
    renderDetails()

    expect(
      await screen.findByRole('heading', { level: 2, name: 'PlayStation' })
    ).toBeInTheDocument()
    expect(screen.getByText('2 games')).toBeInTheDocument()
  })

  it('shows the folder’s path', async () => {
    renderDetails()

    const path = await screen.findByRole('region', { name: 'Folder path' })
    expect(within(path).getByText(PS1_PATH)).toBeInTheDocument()
    expect(within(path).queryByText('Folder not available')).not.toBeInTheDocument()
  })

  it('says when the folder isn’t there anymore', async () => {
    mockGameFolders([{ ...PS1_FOLDER, isAvailable: false }])
    renderDetails()

    const path = await screen.findByRole('region', { name: 'Folder path' })
    expect(within(path).getByText('Folder not available')).toBeInTheDocument()
  })

  it('lists the games saved from the folder, by title', async () => {
    renderDetails()

    const games = await screen.findByRole('region', { name: 'Games' })
    expect(await within(games).findAllByRole('listitem')).toHaveLength(2)
    expect(window.api.library.listFolderGames).toHaveBeenCalledWith(PS1_FOLDER.id)
    const titles = within(games)
      .getAllByRole('button')
      .map((button) => button.textContent)
    expect(titles).toEqual(['Crash Bandicoot (USA)', 'Tekken 3 (USA)'])
  })

  it('says so when no games were saved from it', async () => {
    mockFolderGames([])
    renderDetails()

    expect(await screen.findByText('No games were saved from this folder.')).toBeInTheDocument()
  })

  it('says so when the games can’t be read', async () => {
    mockFolderGames(new Error('No database'))
    renderDetails()

    expect(
      await screen.findByText("The games couldn't be loaded. Try again later.")
    ).toBeInTheDocument()
  })

  it('focuses Scan again first', async () => {
    renderDetails()

    expect(await screen.findByRole('button', { name: 'Scan again' })).toHaveFocus()
  })

  it('returns to the list with the Back button', async () => {
    renderDetails()

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Back' }))

    expect(screen.getByText('Settings screen')).toBeInTheDocument()
  })

  it('says so when the folder is no longer there, with a way back', async () => {
    mockGameFolders([])
    renderDetails()

    expect(
      await screen.findByRole('heading', { name: 'This folder is no longer in Ilnamiki.' })
    ).toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByText('Settings screen')).toBeInTheDocument()
  })

  describe('scanning again', () => {
    it('scans the folder, showing its progress', async () => {
      mockRescanFolder('pending')
      renderDetails()

      await userEvent.setup().click(await screen.findByRole('button', { name: 'Scan again' }))
      act(() => emitScanProgress(42))

      expect(window.api.library.rescanFolder).toHaveBeenCalledWith(PS1_FOLDER.id)
      expect(screen.getByRole('heading', { name: 'Scanning folder' })).toBeInTheDocument()
      expect(screen.getByText(`${PS1_PATH} · PlayStation`)).toBeInTheDocument()
      expect(screen.getByRole('progressbar', { name: 'Scanning folder' })).toHaveValue(42)
      expect(saveChanges()).toHaveAttribute('aria-disabled', 'true')
    })

    it('lists the games found, marking the damaged ones', async () => {
      mockRescanFolder({ ok: true, scan: RESCAN })
      renderDetails()

      await userEvent.setup().click(await screen.findByRole('button', { name: 'Scan again' }))

      expect(await screen.findByRole('heading', { name: 'Games found' })).toBeInTheDocument()
      expect(screen.getByRole('status')).toHaveTextContent('2 games · 1 damaged')
      expect(saveChanges()).toHaveAttribute('aria-disabled', 'false')
    })

    it('saves the changes and returns to the details, with the games read again', async () => {
      mockRescanFolder({ ok: true, scan: RESCAN })
      renderDetails()
      const user = userEvent.setup()
      await user.click(await screen.findByRole('button', { name: 'Scan again' }))
      await screen.findByRole('heading', { name: 'Games found' })
      const updated = { ...PS1_FOLDER, gameCount: 2 }
      mockUpdateGameFolder({ ok: true, folder: updated })
      mockFolderGames([
        { id: 'g3', title: 'Ape Escape (USA)', filePath: `${PS1_PATH}/Ape Escape (USA).chd` },
        GAMES[0]
      ])

      await user.click(saveChanges())

      expect(window.api.library.updateFolder).toHaveBeenCalledWith(RESCAN.id)
      expect(
        await within(gamesList()).findByRole('button', { name: 'Ape Escape (USA)' })
      ).toBeInTheDocument()
      expect(
        within(gamesList()).queryByRole('button', { name: 'Tekken 3 (USA)' })
      ).not.toBeInTheDocument()
      expect(rescan()).toHaveFocus()
    })

    it('says why the changes couldn’t be saved, staying on the results', async () => {
      mockRescanFolder({ ok: true, scan: RESCAN })
      mockUpdateGameFolder({ ok: false, problem: 'unknown-folder' })
      renderDetails()
      const user = userEvent.setup()
      await user.click(await screen.findByRole('button', { name: 'Scan again' }))
      await screen.findByRole('heading', { name: 'Games found' })

      await user.click(saveChanges())

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'This folder is no longer in Ilnamiki.'
      )
      expect(screen.getByRole('heading', { name: 'Games found' })).toBeInTheDocument()
    })

    it('returns to the details with Back, cancelling the scan and saving nothing', async () => {
      mockRescanFolder('pending')
      renderDetails()
      const user = userEvent.setup()
      await user.click(await screen.findByRole('button', { name: 'Scan again' }))

      await user.click(screen.getByRole('button', { name: 'Back' }))

      expect(window.api.library.cancelScan).toHaveBeenCalledOnce()
      expect(window.api.library.updateFolder).not.toHaveBeenCalled()
      expect(screen.getByRole('heading', { name: 'PlayStation' })).toBeInTheDocument()
    })

    it('returns to the details saying why when the folder can’t be scanned', async () => {
      mockRescanFolder({ ok: false, problem: 'not-found' })
      renderDetails()

      await userEvent.setup().click(await screen.findByRole('button', { name: 'Scan again' }))

      expect(await screen.findByRole('alert')).toHaveTextContent("There's no folder at this path.")
      expect(screen.getByRole('heading', { name: 'PlayStation' })).toBeInTheDocument()
    })

    it('returns to the details when the scan fails to reach main', async () => {
      mockRescanFolder(new Error('No main'))
      renderDetails()

      await userEvent.setup().click(await screen.findByRole('button', { name: 'Scan again' }))

      expect(await screen.findByRole('alert')).toHaveTextContent(
        "The folder couldn't be scanned. Try again."
      )
    })
  })

  it('returns from the results to the details on the back action, as a step back', async () => {
    mockRescanFolder({ ok: true, scan: RESCAN })
    const path = getGameFolderDetailsPath(PS1_FOLDER.id)
    const router = createMemoryRouter(APP_ROUTES, { initialEntries: [path] })
    render(<RouterProvider router={router} />)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Scan again' }))
    await screen.findByRole('heading', { name: 'Games found' })

    await user.keyboard('{Escape}')

    expect(router.state.location.pathname).toBe(path)
    expect(screen.getByRole('heading', { name: 'PlayStation' })).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(router.state.location.pathname).toBe(SECTION_PATHS.settings)
  })
})
