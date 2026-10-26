import { describe, expect, it, vi } from 'vitest'

import type { Emulator } from '@shared/api'

import { mockAddEmulator, mockEmulators } from '@renderer/test/api'

import { addEmulator, getEmulatorsState, refreshEmulators, subscribeToEmulators } from './emulators'

const RETROARCH: Emulator = {
  id: 'a1',
  kind: 'retroarch',
  name: 'RetroArch',
  executablePath: '/home/player/Emulators/RetroArch-Linux-x86_64.AppImage',
  version: '1.22.2',
  iconDataUrl: null,
  addedAt: 1_800_000_000_000
}

const REQUEST = { executablePath: RETROARCH.executablePath, name: 'RetroArch' }

describe('emulators store', () => {
  it('is loading until the emulators are read', () => {
    expect(getEmulatorsState()).toEqual({ status: 'loading', emulators: [] })
  })

  it('reads the emulators when the first subscriber arrives, telling it', async () => {
    mockEmulators([RETROARCH])
    const listener = vi.fn()

    subscribeToEmulators(listener)

    await vi.waitFor(() => expect(getEmulatorsState().status).toBe('ready'))
    expect(getEmulatorsState().emulators).toEqual([RETROARCH])
    expect(listener).toHaveBeenCalled()
  })

  it('reads them only once while subscribers stay', () => {
    subscribeToEmulators(vi.fn())
    subscribeToEmulators(vi.fn())

    expect(window.api.emulators.list).toHaveBeenCalledOnce()
  })

  it('reads them again for the first subscriber after all left', () => {
    const unsubscribe = subscribeToEmulators(vi.fn())
    unsubscribe()

    subscribeToEmulators(vi.fn())

    expect(window.api.emulators.list).toHaveBeenCalledTimes(2)
  })

  it('keeps the emulators read when a later read fails', async () => {
    mockEmulators([RETROARCH])
    await refreshEmulators()

    mockEmulators(new Error('No database'))
    await refreshEmulators()

    expect(getEmulatorsState()).toEqual({ status: 'failed', emulators: [RETROARCH] })
  })

  it('reads the emulators again once one is added', async () => {
    mockAddEmulator({ ok: true, emulator: RETROARCH })
    mockEmulators([RETROARCH])

    await addEmulator(REQUEST)

    expect(getEmulatorsState().emulators).toEqual([RETROARCH])
  })

  it('reads nothing again when the emulator could not be added', async () => {
    mockAddEmulator({ ok: false, problem: 'already-added' })

    expect(await addEmulator(REQUEST)).toEqual({ ok: false, problem: 'already-added' })
    expect(window.api.emulators.list).not.toHaveBeenCalled()
  })
})
