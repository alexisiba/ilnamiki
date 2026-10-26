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

const platformSwitch = (name: string): HTMLElement => screen.getByRole('switch', { name })

/** Renders the platforms and waits for them to be read. */
async function renderPlatforms(onSetUpEmulator = vi.fn()): Promise<void> {
  render(<PlatformSettings onSetUpEmulator={onSetUpEmulator} />)
  await screen.findAllByRole('switch')
}

/** Renders the platforms with input navigation and waits for them to be read. */
async function renderNavigablePlatforms(): Promise<void> {
  renderWithNavigation(<PlatformSettings onSetUpEmulator={vi.fn()} />)
  await screen.findAllByRole('switch')
}

describe('PlatformSettings', () => {
  it('shows nothing until the platforms are read, so the empty view never flashes', () => {
    vi.mocked(window.api.platforms.list).mockReturnValue(new Promise(() => {}))
    render(<PlatformSettings onSetUpEmulator={vi.fn()} />)

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('says there are no platforms and how to get one when there are none', async () => {
    render(<PlatformSettings onSetUpEmulator={vi.fn()} />)

    expect(
      await screen.findByRole('heading', { level: 2, name: 'No platforms installed' })
    ).toBeInTheDocument()
    expect(screen.getByText('Set up an emulator to add your first platform.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('takes the user to the emulators from the empty view', async () => {
    const onSetUpEmulator = vi.fn()
    render(<PlatformSettings onSetUpEmulator={onSetUpEmulator} />)

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Set up an emulator' }))

    expect(onSetUpEmulator).toHaveBeenCalledOnce()
  })

  it('says so when the platforms can’t be read', async () => {
    mockPlatforms(new Error('No database'))
    render(<PlatformSettings onSetUpEmulator={vi.fn()} />)

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

  it('shows each platform as a switch, named by the platform and described by its core and extensions', async () => {
    mockPlatforms(PLATFORMS)
    await renderPlatforms()

    expect(screen.getAllByRole('switch')).toHaveLength(2)
    expect(platformSwitch('Nintendo 64')).toHaveAccessibleDescription(
      'Core: Mupen64Plus-Next Extensions: n64 · v64 · z64'
    )
  })

  it('lists every core of a platform, and the extensions they play once each', async () => {
    mockPlatforms([SUPER_NES])
    await renderPlatforms()

    expect(platformSwitch('Super Nintendo')).toHaveAccessibleDescription(
      'Cores: bsnes · Snes9x Extensions: sfc · bs · smc'
    )
  })

  it('leaves the extensions out when the cores don’t declare them', async () => {
    mockPlatforms(PLATFORMS)
    await renderPlatforms()

    expect(platformSwitch('PlayStation')).toHaveAccessibleDescription('Core: SwanStation')
    expect(screen.getAllByText(/^Extensions:/)).toHaveLength(1)
  })

  it('shows every platform on', async () => {
    mockPlatforms(PLATFORMS)
    await renderPlatforms()

    expect(platformSwitch('Nintendo 64')).toBeChecked()
    expect(platformSwitch('PlayStation')).toBeChecked()
  })

  it('turns a platform off and on again when clicked', async () => {
    mockPlatforms(PLATFORMS)
    await renderPlatforms()
    const user = userEvent.setup()

    await user.click(platformSwitch('Nintendo 64'))
    expect(platformSwitch('Nintendo 64')).not.toBeChecked()

    await user.click(platformSwitch('Nintendo 64'))
    expect(platformSwitch('Nintendo 64')).toBeChecked()
  })

  it('scrolls the list to show the platform that takes focus', async () => {
    mockPlatforms(PLATFORMS)
    await renderNavigablePlatforms()
    const list = screen.getByRole('list')
    Object.defineProperty(list, 'scrollHeight', { value: 300 })
    Object.defineProperty(list, 'clientHeight', { value: 150 })
    setRect(list, { left: 0, top: 0, width: 800, height: 150 })
    setRect(platformSwitch('Nintendo 64'), { left: 0, top: 0, width: 800, height: 120 })
    setRect(platformSwitch('PlayStation'), { left: 0, top: 136, width: 800, height: 120 })
    const scrollTo = vi.spyOn(list, 'scrollTo')

    await userEvent.setup().keyboard('{ArrowDown}')

    expect(platformSwitch('PlayStation')).toHaveFocus()
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
    setRect(platformSwitch('Nintendo 64'), { left: 0, top: 0, width: 800, height: 120 })
    setRect(platformSwitch('PlayStation'), { left: 0, top: 136, width: 800, height: 120 })
    const scrollTo = vi.spyOn(list, 'scrollTo')

    await userEvent.setup().keyboard('{ArrowDown}')

    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ top: 122 }))
  })

  it('turns the focused platform off with confirm', async () => {
    mockPlatforms(PLATFORMS)
    await renderNavigablePlatforms()
    const user = userEvent.setup()
    await user.pointer({ target: platformSwitch('PlayStation'), coords: { x: 10, y: 10 } })

    await user.keyboard('{Enter}')

    expect(platformSwitch('PlayStation')).not.toBeChecked()
    expect(platformSwitch('Nintendo 64')).toBeChecked()
  })
})
