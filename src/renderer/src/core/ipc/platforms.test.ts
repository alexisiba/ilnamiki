import { describe, expect, it, vi } from 'vitest'

import type { Emulator, InstalledPlatform } from '@shared/api'

import { mockAddEmulator, mockPlatforms } from '@renderer/test/api'

import { addEmulator, removeEmulator } from './emulators'
import { getPlatformsState, refreshPlatforms, subscribeToPlatforms } from './platforms'

const NINTENDO_64: InstalledPlatform = {
  id: 'nintendo_64',
  name: 'Nintendo 64',
  manufacturer: 'Nintendo',
  cores: [{ id: 'mupen64plus_next', name: 'Mupen64Plus-Next', emulatorId: 'a1', extensions: [] }]
}

const RETROARCH: Emulator = {
  id: 'a1',
  kind: 'retroarch',
  name: 'RetroArch',
  executablePath: '/home/player/Emulators/RetroArch-Linux-x86_64.AppImage',
  version: '1.22.2',
  iconDataUrl: null,
  addedAt: 1_800_000_000_000
}

describe('platforms store', () => {
  it('is loading until the platforms are read', () => {
    expect(getPlatformsState()).toEqual({ status: 'loading', platforms: [] })
  })

  it('reads the platforms when the first subscriber arrives, telling it', async () => {
    mockPlatforms([NINTENDO_64])
    const listener = vi.fn()

    subscribeToPlatforms(listener)

    await vi.waitFor(() => expect(getPlatformsState().status).toBe('ready'))
    expect(getPlatformsState().platforms).toEqual([NINTENDO_64])
    expect(listener).toHaveBeenCalled()
  })

  it('reads them only once while subscribers stay', () => {
    subscribeToPlatforms(vi.fn())
    subscribeToPlatforms(vi.fn())

    expect(window.api.platforms.list).toHaveBeenCalledOnce()
  })

  it('reads them again for the first subscriber after all left', () => {
    const unsubscribe = subscribeToPlatforms(vi.fn())
    unsubscribe()

    subscribeToPlatforms(vi.fn())

    expect(window.api.platforms.list).toHaveBeenCalledTimes(2)
  })

  it('keeps the platforms read when a later read fails', async () => {
    mockPlatforms([NINTENDO_64])
    await refreshPlatforms()

    mockPlatforms(new Error('No database'))
    await refreshPlatforms()

    expect(getPlatformsState()).toEqual({ status: 'failed', platforms: [NINTENDO_64] })
  })

  it('reads the platforms again once an emulator is added, as they come from it', async () => {
    mockAddEmulator({ ok: true, emulator: RETROARCH })
    mockPlatforms([NINTENDO_64])

    await addEmulator({ executablePath: RETROARCH.executablePath, name: 'RetroArch' })

    expect(getPlatformsState().platforms).toEqual([NINTENDO_64])
  })

  it('reads the platforms again once an emulator is removed', async () => {
    mockPlatforms([NINTENDO_64])
    await refreshPlatforms()
    mockPlatforms([])

    await removeEmulator(RETROARCH.id)

    expect(getPlatformsState().platforms).toEqual([])
  })

  it('reads nothing again when the emulator could not be added', async () => {
    mockAddEmulator({ ok: false, problem: 'already-added' })

    await addEmulator({ executablePath: RETROARCH.executablePath, name: 'RetroArch' })

    expect(window.api.platforms.list).not.toHaveBeenCalled()
  })
})
