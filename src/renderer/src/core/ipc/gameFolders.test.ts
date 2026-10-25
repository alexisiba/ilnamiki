import { describe, expect, it, vi } from 'vitest'

import type { GameFolder } from '@shared/api'

import { mockAddGameFolder, mockGameFolders } from '@renderer/test/api'

import {
  addGameFolder,
  getGameFoldersState,
  refreshGameFolders,
  subscribeToGameFolders
} from './gameFolders'

const PS1_FOLDER: GameFolder = {
  id: 'f1',
  path: '/home/player/Games/PS1',
  platformId: 'playstation',
  gameCount: 42,
  isAvailable: true,
  addedAt: 1_800_000_000_000
}

const SCAN_ID = '0b6c7b5e-3f43-4c1e-9d2a-6f0e8a1b2c3d'

describe('game folders store', () => {
  it('is loading until the folders are read', () => {
    expect(getGameFoldersState()).toEqual({ status: 'loading', folders: [] })
  })

  it('reads the folders when the first subscriber arrives, telling it', async () => {
    mockGameFolders([PS1_FOLDER])
    const listener = vi.fn()

    subscribeToGameFolders(listener)

    await vi.waitFor(() => expect(getGameFoldersState().status).toBe('ready'))
    expect(getGameFoldersState().folders).toEqual([PS1_FOLDER])
    expect(listener).toHaveBeenCalled()
  })

  it('reads them only once while subscribers stay', () => {
    subscribeToGameFolders(vi.fn())
    subscribeToGameFolders(vi.fn())

    expect(window.api.library.listFolders).toHaveBeenCalledOnce()
  })

  it('keeps the folders read when a later read fails', async () => {
    mockGameFolders([PS1_FOLDER])
    await refreshGameFolders()

    mockGameFolders(new Error('No database'))
    await refreshGameFolders()

    expect(getGameFoldersState()).toEqual({ status: 'failed', folders: [PS1_FOLDER] })
  })

  it('reads the folders again once one is added', async () => {
    mockAddGameFolder({ ok: true, folder: PS1_FOLDER })
    mockGameFolders([PS1_FOLDER])

    await addGameFolder(SCAN_ID)

    expect(window.api.library.addFolder).toHaveBeenCalledWith(SCAN_ID)
    expect(getGameFoldersState().folders).toEqual([PS1_FOLDER])
  })

  it('reads nothing again when the folder could not be added', async () => {
    mockAddGameFolder({ ok: false, problem: 'no-games' })

    expect(await addGameFolder(SCAN_ID)).toEqual({ ok: false, problem: 'no-games' })
    expect(window.api.library.listFolders).not.toHaveBeenCalled()
  })
})
