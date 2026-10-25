import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { GameFolder } from '@renderer/types/gameFolder'

import { GameFolderSettings } from './GameFolderSettings'
import type { GameFolderSettingsProps } from './GameFolderSettings.types'

const FOLDERS: GameFolder[] = [
  { id: 'nintendo-64', platform: 'Nintendo 64', gameCount: 17 },
  { id: 'playstation-2', platform: 'PlayStation 2', gameCount: 1 }
]

function renderGameFolders(props: Partial<GameFolderSettingsProps> = {}): void {
  render(
    <GameFolderSettings
      folders={FOLDERS}
      hasInstalledPlatforms
      onSetUpEmulator={vi.fn()}
      onAdd={vi.fn()}
      {...props}
    />
  )
}

const emptyTitle = (): HTMLElement | null =>
  screen.queryByRole('heading', { level: 2, name: 'No game folders configured' })
const addFolder = (): HTMLElement | null => screen.queryByRole('button', { name: 'Add folder' })
const setUpEmulator = (): HTMLElement | null =>
  screen.queryByRole('button', { name: 'Set up an emulator' })

describe('GameFolderSettings', () => {
  it('shows one item per folder, in order, named by its platform and described by its games', () => {
    renderGameFolders()

    const [first, second] = screen.getAllByRole('listitem')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(within(first).getByRole('button')).toHaveAccessibleName('Nintendo 64')
    expect(within(first).getByRole('button')).toHaveAccessibleDescription('17 games')
    expect(within(second).getByRole('button')).toHaveAccessibleName('PlayStation 2')
  })

  it('counts a single game in the singular', () => {
    renderGameFolders()

    expect(screen.getByRole('button', { name: 'PlayStation 2' })).toHaveAccessibleDescription(
      '1 game'
    )
  })

  it('offers to add a folder below the list', () => {
    renderGameFolders()

    expect(screen.getByRole('list')).not.toContainElement(addFolder())
  })

  it('opens the form to add a folder when Add folder is clicked', async () => {
    const onAdd = vi.fn()
    renderGameFolders({ onAdd })

    await userEvent.setup().click(addFolder()!)

    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('has no heading of its own, as the selected category names it', () => {
    renderGameFolders()

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  describe('without folders or installed cores', () => {
    const renderEmpty = (): void => renderGameFolders({ folders: [], hasInstalledPlatforms: false })

    it('says there are no folders and that a core is needed first', () => {
      renderEmpty()

      expect(emptyTitle()).toBeInTheDocument()
      expect(screen.getByText(/don't have any cores installed yet/)).toBeInTheDocument()
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })

    it('offers to set up an emulator instead of adding a folder', () => {
      renderEmpty()

      expect(setUpEmulator()).toBeInTheDocument()
      expect(addFolder()).not.toBeInTheDocument()
    })

    it('takes the user to the emulators', async () => {
      const onSetUpEmulator = vi.fn()
      renderGameFolders({ folders: [], hasInstalledPlatforms: false, onSetUpEmulator })

      await userEvent.setup().click(setUpEmulator()!)

      expect(onSetUpEmulator).toHaveBeenCalledOnce()
    })
  })

  describe('without folders but with installed cores', () => {
    const renderEmpty = (): void => renderGameFolders({ folders: [], hasInstalledPlatforms: true })

    it('says there are no folders and how to add the first one', () => {
      renderEmpty()

      expect(emptyTitle()).toBeInTheDocument()
      expect(
        screen.getByText('Add your first game folder with the Add folder button.')
      ).toBeInTheDocument()
    })

    it('offers to add a folder instead of setting up an emulator', () => {
      renderEmpty()

      expect(addFolder()).toBeInTheDocument()
      expect(setUpEmulator()).not.toBeInTheDocument()
    })
  })

  it('keeps Add folder with the list even when no core is installed', () => {
    renderGameFolders({ hasInstalledPlatforms: false })

    expect(addFolder()).toBeInTheDocument()
    expect(emptyTitle()).not.toBeInTheDocument()
  })
})
