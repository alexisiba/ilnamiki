import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { GameFolder, InstalledPlatform } from '@shared/api'

import { getGameFoldersState } from '@renderer/core/ipc/gameFolders'
import { getPlatformsState } from '@renderer/core/ipc/platforms'
import { mockGameFolders, mockPlatforms } from '@renderer/test/api'

import { GameFolderSettings } from './GameFolderSettings'
import type { GameFolderSettingsProps } from './GameFolderSettings.types'

const NINTENDO_64: InstalledPlatform = {
  id: 'nintendo_64',
  name: 'Nintendo 64',
  manufacturer: 'Nintendo',
  cores: [{ id: 'mupen64plus_next', name: 'Mupen64Plus-Next', emulatorId: 'a1', extensions: [] }]
}

const FOLDERS: GameFolder[] = [
  {
    id: 'f1',
    path: '/home/player/Games/N64',
    platformId: 'nintendo_64',
    gameCount: 17,
    isAvailable: true,
    addedAt: 1
  },
  {
    id: 'f2',
    path: '/media/player/Disk/PS2',
    platformId: 'playstation_2',
    gameCount: 1,
    isAvailable: false,
    addedAt: 2
  }
]

/** Renders the game folders and waits for the folders and platforms to be read. */
async function renderGameFolders(props: Partial<GameFolderSettingsProps> = {}): Promise<void> {
  render(<GameFolderSettings onSetUpEmulator={vi.fn()} onAdd={vi.fn()} {...props} />)
  await vi.waitFor(() => {
    expect(getGameFoldersState().status).not.toBe('loading')
    expect(getPlatformsState().status).not.toBe('loading')
  })
}

const emptyTitle = (): HTMLElement | null =>
  screen.queryByRole('heading', { level: 2, name: 'No game folders configured' })
const addFolder = (): HTMLElement | null => screen.queryByRole('button', { name: 'Add folder' })
const setUpEmulator = (): HTMLElement | null =>
  screen.queryByRole('button', { name: 'Set up an emulator' })

describe('GameFolderSettings', () => {
  it('shows one item per folder, in order, named by its platform and described by its games', async () => {
    mockGameFolders(FOLDERS)
    mockPlatforms([NINTENDO_64])
    await renderGameFolders()

    const [first] = screen.getAllByRole('listitem')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(within(first).getByRole('button')).toHaveAccessibleName('Nintendo 64')
    expect(within(first).getByRole('button')).toHaveAccessibleDescription('17 games')
  })

  it('names a folder by its platform’s id when no installed core plays it anymore', async () => {
    mockGameFolders(FOLDERS)
    mockPlatforms([NINTENDO_64])
    await renderGameFolders()

    expect(screen.getByRole('button', { name: 'playstation_2' })).toBeInTheDocument()
  })

  it('counts a single game in the singular and says when a folder isn’t there anymore', async () => {
    mockGameFolders(FOLDERS)
    await renderGameFolders()

    expect(screen.getByRole('button', { name: 'playstation_2' })).toHaveAccessibleDescription(
      '1 game Folder not available'
    )
    expect(screen.getAllByText('Folder not available')).toHaveLength(1)
  })

  it('offers to add a folder below the list', async () => {
    mockGameFolders(FOLDERS)
    await renderGameFolders()

    expect(addFolder()).toBeInTheDocument()
    expect(screen.getByRole('list')).not.toContainElement(addFolder())
  })

  it('opens the form to add a folder when Add folder is clicked', async () => {
    const onAdd = vi.fn()
    mockGameFolders(FOLDERS)
    await renderGameFolders({ onAdd })

    await userEvent.setup().click(addFolder()!)

    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('has no heading of its own, as the selected category names it', async () => {
    mockGameFolders(FOLDERS)
    await renderGameFolders()

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('shows nothing until the folders and platforms are read, so no empty view flashes', () => {
    vi.mocked(window.api.library.listFolders).mockReturnValue(new Promise(() => {}))
    render(<GameFolderSettings onSetUpEmulator={vi.fn()} onAdd={vi.fn()} />)

    expect(emptyTitle()).not.toBeInTheDocument()
    expect(addFolder()).not.toBeInTheDocument()
    expect(setUpEmulator()).not.toBeInTheDocument()
  })

  it('says so when the folders can’t be read', async () => {
    mockGameFolders(new Error('No database'))
    await renderGameFolders()

    expect(
      screen.getByRole('heading', { name: "The game folders couldn't be loaded" })
    ).toBeInTheDocument()
  })

  describe('without folders or installed cores', () => {
    it('says there are no folders and that a core is needed first', async () => {
      await renderGameFolders()

      expect(emptyTitle()).toBeInTheDocument()
      expect(screen.getByText(/don't have any cores installed yet/)).toBeInTheDocument()
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })

    it('offers to set up an emulator instead of adding a folder', async () => {
      await renderGameFolders()

      expect(setUpEmulator()).toBeInTheDocument()
      expect(addFolder()).not.toBeInTheDocument()
    })

    it('takes the user to the emulators', async () => {
      const onSetUpEmulator = vi.fn()
      await renderGameFolders({ onSetUpEmulator })

      await userEvent.setup().click(setUpEmulator()!)

      expect(onSetUpEmulator).toHaveBeenCalledOnce()
    })
  })

  describe('without folders but with installed cores', () => {
    it('says there are no folders and how to add the first one', async () => {
      mockPlatforms([NINTENDO_64])
      await renderGameFolders()

      expect(emptyTitle()).toBeInTheDocument()
      expect(
        screen.getByText('Add your first game folder with the Add folder button.')
      ).toBeInTheDocument()
    })

    it('offers to add a folder instead of setting up an emulator', async () => {
      mockPlatforms([NINTENDO_64])
      await renderGameFolders()

      expect(addFolder()).toBeInTheDocument()
      expect(setUpEmulator()).not.toBeInTheDocument()
    })
  })

  it('keeps Add folder with the list even when no core is installed', async () => {
    mockGameFolders(FOLDERS)
    await renderGameFolders()

    expect(addFolder()).toBeInTheDocument()
    expect(emptyTitle()).not.toBeInTheDocument()
  })
})
