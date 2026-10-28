import { act, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import type {
  Emulator,
  GameFolder,
  InstalledPlatform,
  LastPlayedGame,
  RecentlyAddedGame
} from '@shared/api'

import { NavigationProvider, SECTION_PATHS } from '@renderer/core/navigation'
import {
  emitGameEnded,
  emitMetadataChanged,
  mockEmulators,
  mockGameFolders,
  mockLastPlayedGame,
  mockPlatforms,
  mockRecentlyAddedGames,
  mockRecentlyPlayedGames,
  NO_ARTWORK
} from '@renderer/test/api'

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
  emulators: [
    {
      emulatorId: RETROARCH.id,
      emulatorName: 'RetroArch',
      optionId: 'mupen64plus_next',
      optionName: 'Mupen64Plus-Next',
      extensions: []
    }
  ],
  isEnabled: true,
  defaultEmulator: null
}

const N64_FOLDER: GameFolder = {
  id: 'f1',
  path: '/home/player/Games/N64',
  platformId: 'nintendo_64',
  gameCount: 12,
  isAvailable: true,
  addedAt: 1
}

const OCARINA: LastPlayedGame = {
  id: 'g1',
  title: 'The Legend of Zelda - Ocarina of Time (USA)',
  platformId: 'nintendo_64',
  artwork: NO_ARTWORK,
  lastPlayedAt: 1_800_000_000_000,
  playtimeMs: 90 * 60 * 1000
}

const RECENTLY_ADDED: RecentlyAddedGame[] = [
  {
    id: 'g2',
    title: 'Super Mario 64 (USA)',
    platformId: 'nintendo_64',
    artwork: NO_ARTWORK,
    addedAt: 2
  },
  { id: 'g1', title: OCARINA.title, platformId: 'nintendo_64', artwork: NO_ARTWORK, addedAt: 1 }
]

/** The section under the "Recently added" heading. */
const recentlyAddedShelf = async (): Promise<HTMLElement> => {
  const heading = await screen.findByRole('heading', { level: 2, name: 'Recently added' })
  return heading.closest('section') as HTMLElement
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

  it('offers to add a folder of games while no folder has games', async () => {
    mockEmulators([RETROARCH])
    mockPlatforms([NINTENDO_64])
    mockGameFolders([{ ...N64_FOLDER, gameCount: 0 }])
    renderHome()

    expect(await screen.findByRole('heading', { name: 'Add your games' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to Settings' })).toHaveFocus()
    expect(screen.getByText('1 console linked')).toBeInTheDocument()
  })

  it('offers to add a folder of games again while every platform is off', async () => {
    mockEmulators([RETROARCH])
    mockPlatforms([{ ...NINTENDO_64, isEnabled: false }])
    mockGameFolders([N64_FOLDER])
    renderHome()

    expect(await screen.findByRole('heading', { name: 'Add your games' })).toBeInTheDocument()
  })

  it('counts only the games and consoles of the platforms that are on', async () => {
    mockEmulators([RETROARCH])
    mockPlatforms([NINTENDO_64, { ...NINTENDO_64, id: 'nes', name: 'NES', isEnabled: false }])
    mockGameFolders([
      N64_FOLDER,
      { ...N64_FOLDER, id: 'f2', path: '/home/player/Games/NES', platformId: 'nes' }
    ])
    renderHome()

    expect(
      await screen.findByRole('heading', { name: '12 games ready to play' })
    ).toBeInTheDocument()
    expect(screen.getByText('1 console')).toBeInTheDocument()
  })

  it('shows the games of every folder ready to play while none was played', async () => {
    mockEmulators([RETROARCH])
    mockPlatforms([NINTENDO_64])
    mockGameFolders([
      N64_FOLDER,
      { ...N64_FOLDER, id: 'f2', path: '/home/player/Games/NES', platformId: 'nes' }
    ])
    renderHome()

    expect(
      await screen.findByRole('heading', { name: '24 games ready to play' })
    ).toBeInTheDocument()
    expect(screen.getByText('1 emulator')).toBeInTheDocument()
    expect(screen.getByText('1 console')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Explore library' })).toHaveFocus()
    expect(screen.queryByRole('heading', { name: 'Add your games' })).not.toBeInTheDocument()
  })

  it('shows the last played game, ready to continue, once one was played', async () => {
    mockEmulators([RETROARCH])
    mockPlatforms([NINTENDO_64])
    mockGameFolders([N64_FOLDER])
    mockLastPlayedGame(OCARINA)
    renderHome()

    expect(
      await screen.findByRole('heading', { level: 1, name: OCARINA.title })
    ).toBeInTheDocument()
    expect(screen.getByText('Total playtime: 1 h 30 min')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue playing' })).toHaveFocus()
    expect(screen.queryByText('Ready to play')).not.toBeInTheDocument()
  })

  it('shows the games added last, with their console, below the games ready to play', async () => {
    mockEmulators([RETROARCH])
    mockPlatforms([NINTENDO_64])
    mockGameFolders([N64_FOLDER])
    mockRecentlyAddedGames(RECENTLY_ADDED)
    renderHome()

    const [newest, oldest] = within(await recentlyAddedShelf()).getAllByRole('button')
    expect(newest).toHaveAccessibleName('Super Mario 64 (USA)')
    expect(newest).toHaveAccessibleDescription('Nintendo 64')
    expect(oldest).toHaveAccessibleName(OCARINA.title)
    expect(screen.getByRole('button', { name: 'Explore library' })).toHaveFocus()
  })

  it('shows the games added last below the last played game', async () => {
    mockEmulators([RETROARCH])
    mockPlatforms([NINTENDO_64])
    mockGameFolders([N64_FOLDER])
    mockLastPlayedGame(OCARINA)
    mockRecentlyAddedGames(RECENTLY_ADDED)
    renderHome()

    expect(
      within(await recentlyAddedShelf()).getByRole('button', { name: 'Super Mario 64 (USA)' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue playing' })).toHaveFocus()
  })

  it('shows the games added last as their metadata is found, without leaving Home', async () => {
    mockEmulators([RETROARCH])
    mockPlatforms([NINTENDO_64])
    mockGameFolders([N64_FOLDER])
    mockRecentlyAddedGames(RECENTLY_ADDED)
    renderHome()
    await within(await recentlyAddedShelf()).findByRole('button', {
      name: 'Super Mario 64 (USA)'
    })

    mockRecentlyAddedGames([{ ...RECENTLY_ADDED[0], title: 'Super Mario 64' }, RECENTLY_ADDED[1]])
    act(() => emitMetadataChanged('g2'))

    expect(
      await within(await recentlyAddedShelf()).findByRole('button', { name: 'Super Mario 64' })
    ).toBeInTheDocument()
  })

  it('leaves the games added last out when they can’t be read', async () => {
    mockEmulators([RETROARCH])
    mockPlatforms([NINTENDO_64])
    mockGameFolders([N64_FOLDER])
    mockRecentlyAddedGames(new Error('No main'))
    renderHome()

    expect(await screen.findByText('Ready to play')).toBeInTheDocument()
    await vi.waitFor(() => expect(window.api.games.listRecentlyAdded).toHaveBeenCalled())
    expect(screen.queryByRole('heading', { name: 'Recently added' })).not.toBeInTheDocument()
  })

  it('shows the games played before the last one, with when each was played', async () => {
    mockEmulators([RETROARCH])
    mockPlatforms([NINTENDO_64])
    mockGameFolders([N64_FOLDER])
    mockLastPlayedGame(OCARINA)
    mockRecentlyPlayedGames([
      {
        id: 'g2',
        title: 'Super Mario 64 (USA)',
        platformId: 'nintendo_64',
        artwork: NO_ARTWORK,
        lastPlayedAt: new Date(2020, 0, 15).getTime()
      }
    ])
    renderHome()

    const playAgain = await screen.findByRole('heading', { level: 2, name: 'Play again' })
    const card = within(playAgain.closest('section') as HTMLElement).getByRole('button')
    expect(card).toHaveAccessibleName('Super Mario 64 (USA)')
    expect(card).toHaveAccessibleDescription('Nintendo 64 Jan 15, 2020')
  })

  it('leaves the games played before out while only one game was played', async () => {
    mockEmulators([RETROARCH])
    mockPlatforms([NINTENDO_64])
    mockGameFolders([N64_FOLDER])
    mockLastPlayedGame(OCARINA)
    renderHome()

    expect(
      await screen.findByRole('heading', { level: 1, name: OCARINA.title })
    ).toBeInTheDocument()
    await vi.waitFor(() => expect(window.api.games.listRecentlyPlayed).toHaveBeenCalled())
    expect(screen.queryByRole('heading', { name: 'Play again' })).not.toBeInTheDocument()
  })

  it('reads the games played before again when a game ends', async () => {
    mockEmulators([RETROARCH])
    mockPlatforms([NINTENDO_64])
    mockGameFolders([N64_FOLDER])
    mockLastPlayedGame(OCARINA)
    renderHome()
    await screen.findByRole('heading', { level: 1, name: OCARINA.title })

    mockRecentlyPlayedGames([
      {
        id: 'g2',
        title: 'Super Mario 64 (USA)',
        platformId: 'nintendo_64',
        artwork: NO_ARTWORK,
        lastPlayedAt: 1
      }
    ])
    act(() => emitGameEnded('g2'))

    expect(await screen.findByRole('heading', { name: 'Play again' })).toBeInTheDocument()
  })

  it('shows the game just played once the first game ends', async () => {
    mockEmulators([RETROARCH])
    mockPlatforms([NINTENDO_64])
    mockGameFolders([N64_FOLDER])
    renderHome()
    expect(await screen.findByText('Ready to play')).toBeInTheDocument()

    mockLastPlayedGame(OCARINA)
    emitGameEnded(OCARINA.id)

    expect(
      await screen.findByRole('heading', { level: 1, name: OCARINA.title })
    ).toBeInTheDocument()
  })

  it('shows nothing until the last played game is read, so no view flashes', async () => {
    mockEmulators([RETROARCH])
    mockPlatforms([NINTENDO_64])
    mockGameFolders([N64_FOLDER])
    vi.mocked(window.api.games.getLastPlayed).mockReturnValue(new Promise(() => {}))
    renderHome()

    await vi.waitFor(() => expect(window.api.library.listFolders).toHaveBeenCalled())
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows nothing until the game folders are read, so no view flashes', async () => {
    mockEmulators([RETROARCH])
    mockPlatforms([NINTENDO_64])
    vi.mocked(window.api.library.listFolders).mockReturnValue(new Promise(() => {}))
    renderHome()

    await vi.waitFor(() => expect(window.api.platforms.list).toHaveBeenCalled())
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
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
