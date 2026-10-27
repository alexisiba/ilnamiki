import { describe, expect, it, vi } from 'vitest'

import type { Emulator, InstalledPlatform } from '@shared/api'

import { mockAddEmulator, mockPlatformPhotos, mockPlatforms } from '@renderer/test/api'

import { addEmulator, removeEmulator } from './emulators'
import {
  findPlatformPhoto,
  getPlatformPhoto,
  getPlatformsState,
  refreshPlatforms,
  setPlatformDefaultEmulator,
  setPlatformEnabled,
  subscribeToPlatforms
} from './platforms'

const NINTENDO_64: InstalledPlatform = {
  id: 'nintendo_64',
  name: 'Nintendo 64',
  manufacturer: 'Nintendo',
  emulators: [
    {
      emulatorId: 'a1',
      emulatorName: 'RetroArch',
      optionId: 'mupen64plus_next',
      optionName: 'Mupen64Plus-Next',
      extensions: []
    }
  ],
  isEnabled: true,
  defaultEmulator: null
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
  it('turns a platform off in main and shows it off, without reading them again', async () => {
    mockPlatforms([NINTENDO_64])
    await refreshPlatforms()
    const listener = vi.fn()
    subscribeToPlatforms(listener)

    await setPlatformEnabled('nintendo_64', false)

    expect(window.api.platforms.setEnabled).toHaveBeenCalledWith('nintendo_64', false)
    expect(getPlatformsState().platforms).toEqual([{ ...NINTENDO_64, isEnabled: false }])
    expect(listener).toHaveBeenCalled()
  })

  it('keeps a platform’s default emulator in main and shows it, without reading them again', async () => {
    mockPlatforms([NINTENDO_64])
    await refreshPlatforms()
    const emulator = { emulatorId: 'a1', optionId: 'mupen64plus_next' }

    await setPlatformDefaultEmulator('nintendo_64', emulator)

    expect(window.api.platforms.setDefaultEmulator).toHaveBeenCalledWith('nintendo_64', emulator)
    expect(getPlatformsState().platforms).toEqual([{ ...NINTENDO_64, defaultEmulator: emulator }])
    expect(window.api.platforms.list).toHaveBeenCalledOnce()
  })

  it('changes no default emulator when main can’t keep it', async () => {
    mockPlatforms([NINTENDO_64])
    await refreshPlatforms()
    vi.mocked(window.api.platforms.setDefaultEmulator).mockRejectedValue(new Error('No database'))

    await expect(
      setPlatformDefaultEmulator('nintendo_64', { emulatorId: 'a1', optionId: 'mupen64plus_next' })
    ).rejects.toThrow('No database')

    expect(getPlatformsState().platforms).toEqual([NINTENDO_64])
  })

  it('changes nothing when main can’t keep a platform on or off', async () => {
    mockPlatforms([NINTENDO_64])
    await refreshPlatforms()
    vi.mocked(window.api.platforms.setEnabled).mockRejectedValue(new Error('No database'))

    await expect(setPlatformEnabled('nintendo_64', false)).rejects.toThrow('No database')

    expect(getPlatformsState().platforms).toEqual([NINTENDO_64])
  })

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

describe('getPlatformPhoto', () => {
  it('asks main for a console’s photo once, then gives the one it got', async () => {
    mockPlatformPhotos({ nintendo_64: 'data:image/png;base64,bjY0' })

    expect(await getPlatformPhoto('nintendo_64')).toBe('data:image/png;base64,bjY0')
    expect(await getPlatformPhoto('nintendo_64')).toBe('data:image/png;base64,bjY0')
    expect(findPlatformPhoto('nintendo_64')).toBe('data:image/png;base64,bjY0')
    expect(window.api.platforms.getPhoto).toHaveBeenCalledTimes(1)
  })

  it('asks again for a photo main had none of, as it may download it later', async () => {
    mockPlatformPhotos({})

    expect(await getPlatformPhoto('nintendo_64')).toBeNull()
    expect(await getPlatformPhoto('nintendo_64')).toBeNull()
    expect(findPlatformPhoto('nintendo_64')).toBeUndefined()
    expect(window.api.platforms.getPhoto).toHaveBeenCalledTimes(2)
  })
})
