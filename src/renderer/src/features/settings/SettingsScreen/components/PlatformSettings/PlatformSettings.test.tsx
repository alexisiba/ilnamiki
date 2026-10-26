import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { InstalledPlatform } from '@shared/api'

import { mockPlatforms } from '@renderer/test/api'
import { setRect } from '@renderer/test/layout'
import { renderWithNavigation } from '@renderer/test/renderWithNavigation'

import { PlatformSettings } from './PlatformSettings'

const PLATFORMS: InstalledPlatform[] = [
  {
    id: 'nintendo_64',
    name: 'Nintendo 64',
    manufacturer: 'Nintendo',
    cores: [
      {
        id: 'mupen64plus_next',
        name: 'Mupen64Plus-Next',
        emulatorId: 'a1',
        extensions: ['n64', 'v64', 'z64']
      }
    ]
  },
  {
    id: 'playstation',
    name: 'PlayStation',
    manufacturer: 'Sony',
    cores: [{ id: 'swanstation', name: 'SwanStation', emulatorId: 'a1', extensions: [] }]
  }
]

const SUPER_NES: InstalledPlatform = {
  id: 'super_nes',
  name: 'Super Nintendo',
  manufacturer: 'Nintendo',
  cores: [
    { id: 'bsnes', name: 'bsnes', emulatorId: 'a1', extensions: ['sfc', 'bs'] },
    { id: 'snes9x', name: 'Snes9x', emulatorId: 'a1', extensions: ['smc', 'sfc'] }
  ]
}

const platformItem = (name: string): HTMLElement => screen.getByRole('button', { name })

/** Renders the platforms and waits for them to be read. */
async function renderPlatforms(onOpen = vi.fn()): Promise<void> {
  render(<PlatformSettings onSetUpEmulator={vi.fn()} onOpen={onOpen} />)
  await screen.findAllByRole('listitem')
}

/** Renders the platforms with input navigation and waits for them to be read. */
async function renderNavigablePlatforms(onOpen = vi.fn()): Promise<void> {
  renderWithNavigation(<PlatformSettings onSetUpEmulator={vi.fn()} onOpen={onOpen} />)
  await screen.findAllByRole('listitem')
}

describe('PlatformSettings', () => {
  it('shows nothing until the platforms are read, so the empty view never flashes', () => {
    vi.mocked(window.api.platforms.list).mockReturnValue(new Promise(() => {}))
    render(<PlatformSettings onSetUpEmulator={vi.fn()} onOpen={vi.fn()} />)

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('says there are no platforms and how to get one when there are none', async () => {
    render(<PlatformSettings onSetUpEmulator={vi.fn()} onOpen={vi.fn()} />)

    expect(
      await screen.findByRole('heading', { level: 2, name: 'No platforms installed' })
    ).toBeInTheDocument()
    expect(screen.getByText('Set up an emulator to add your first platform.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('takes the user to the emulators from the empty view', async () => {
    const onSetUpEmulator = vi.fn()
    render(<PlatformSettings onSetUpEmulator={onSetUpEmulator} onOpen={vi.fn()} />)

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Set up an emulator' }))

    expect(onSetUpEmulator).toHaveBeenCalledOnce()
  })

  it('says so when the platforms can’t be read', async () => {
    mockPlatforms(new Error('No database'))
    render(<PlatformSettings onSetUpEmulator={vi.fn()} onOpen={vi.fn()} />)

    expect(
      await screen.findByRole('heading', { level: 2, name: "The platforms couldn't be loaded" })
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Set up an emulator' })).not.toBeInTheDocument()
  })

  it('has no heading of its own, as the selected category names it', async () => {
    mockPlatforms(PLATFORMS)
    await renderPlatforms()

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('shows each platform as a button, named by the platform and described by its core and extensions', async () => {
    mockPlatforms(PLATFORMS)
    await renderPlatforms()

    expect(screen.getAllByRole('button')).toHaveLength(2)
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    expect(platformItem('Nintendo 64')).toHaveAccessibleDescription(
      'Core: Mupen64Plus-Next Extensions: n64 · v64 · z64'
    )
  })

  it('lists every core of a platform, and the extensions they play once each', async () => {
    mockPlatforms([SUPER_NES])
    await renderPlatforms()

    expect(platformItem('Super Nintendo')).toHaveAccessibleDescription(
      'Cores: bsnes · Snes9x Extensions: sfc · bs · smc'
    )
  })

  it('leaves the extensions out when the cores don’t declare them', async () => {
    mockPlatforms(PLATFORMS)
    await renderPlatforms()

    expect(platformItem('PlayStation')).toHaveAccessibleDescription('Core: SwanStation')
    expect(screen.getAllByText(/^Extensions:/)).toHaveLength(1)
  })

  it('opens a platform’s details when clicked', async () => {
    mockPlatforms(PLATFORMS)
    const onOpen = vi.fn()
    await renderPlatforms(onOpen)

    await userEvent.setup().click(platformItem('Nintendo 64'))

    expect(onOpen).toHaveBeenCalledExactlyOnceWith('nintendo_64')
  })

  it('scrolls the list to show the platform that takes focus', async () => {
    mockPlatforms(PLATFORMS)
    await renderNavigablePlatforms()
    const list = screen.getByRole('list')
    Object.defineProperty(list, 'scrollHeight', { value: 300 })
    Object.defineProperty(list, 'clientHeight', { value: 150 })
    setRect(list, { left: 0, top: 0, width: 800, height: 150 })
    setRect(platformItem('Nintendo 64'), { left: 0, top: 0, width: 800, height: 120 })
    setRect(platformItem('PlayStation'), { left: 0, top: 136, width: 800, height: 120 })
    const scrollTo = vi.spyOn(list, 'scrollTo')

    await userEvent.setup().keyboard('{ArrowDown}')

    expect(platformItem('PlayStation')).toHaveFocus()
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ top: 106 }))
  })

  it('keeps the list’s scroll padding past the focused platform', async () => {
    mockPlatforms(PLATFORMS)
    await renderNavigablePlatforms()
    const list = screen.getByRole('list')
    list.style.setProperty('scroll-padding-block-end', '16px')
    Object.defineProperty(list, 'scrollHeight', { value: 300 })
    Object.defineProperty(list, 'clientHeight', { value: 150 })
    setRect(list, { left: 0, top: 0, width: 800, height: 150 })
    setRect(platformItem('Nintendo 64'), { left: 0, top: 0, width: 800, height: 120 })
    setRect(platformItem('PlayStation'), { left: 0, top: 136, width: 800, height: 120 })
    const scrollTo = vi.spyOn(list, 'scrollTo')

    await userEvent.setup().keyboard('{ArrowDown}')

    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ top: 122 }))
  })

  it('opens the focused platform’s details with confirm', async () => {
    mockPlatforms(PLATFORMS)
    const onOpen = vi.fn()
    await renderNavigablePlatforms(onOpen)
    const user = userEvent.setup()
    await user.pointer({ target: platformItem('PlayStation'), coords: { x: 10, y: 10 } })

    await user.keyboard('{Enter}')

    expect(onOpen).toHaveBeenCalledExactlyOnceWith('playstation')
  })
})
