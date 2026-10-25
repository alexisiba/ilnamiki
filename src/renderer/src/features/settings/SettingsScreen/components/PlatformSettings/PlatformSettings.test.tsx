import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { setRect } from '@renderer/test/layout'
import { renderWithNavigation } from '@renderer/test/renderWithNavigation'
import type { AssociatedPlatform } from '@renderer/types/associatedPlatform'

import { PlatformSettings } from './PlatformSettings'

const PLATFORMS: AssociatedPlatform[] = [
  {
    id: 'nintendo_64',
    name: 'Nintendo 64',
    core: 'Mupen64Plus-Next',
    extensions: ['n64', 'v64', 'z64'],
    enabled: true
  },
  { id: 'playstation', name: 'PlayStation', core: 'SwanStation', extensions: [], enabled: false }
]

const platformSwitch = (name: string): HTMLElement => screen.getByRole('switch', { name })

describe('PlatformSettings', () => {
  it('says there are no platforms and how to get one when there are none', () => {
    render(<PlatformSettings platforms={[]} onSetUpEmulator={vi.fn()} />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'No platforms installed' })
    ).toBeInTheDocument()
    expect(screen.getByText('Set up an emulator to add your first platform.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('takes the user to the emulators from the empty view', async () => {
    const onSetUpEmulator = vi.fn()
    render(<PlatformSettings platforms={[]} onSetUpEmulator={onSetUpEmulator} />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Set up an emulator' }))

    expect(onSetUpEmulator).toHaveBeenCalledOnce()
  })

  it('has no heading of its own, as the selected category names it', () => {
    render(<PlatformSettings platforms={PLATFORMS} onSetUpEmulator={vi.fn()} />)

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('shows each platform as a switch, named by the platform and described by its core and extensions', () => {
    render(<PlatformSettings platforms={PLATFORMS} onSetUpEmulator={vi.fn()} />)

    expect(screen.getAllByRole('switch')).toHaveLength(2)
    expect(platformSwitch('Nintendo 64')).toHaveAccessibleDescription(
      'Core: Mupen64Plus-Next Extensions: n64 · v64 · z64'
    )
  })

  it('leaves the extensions out when the core does not declare them', () => {
    render(<PlatformSettings platforms={PLATFORMS} onSetUpEmulator={vi.fn()} />)

    expect(platformSwitch('PlayStation')).toHaveAccessibleDescription('Core: SwanStation')
    expect(screen.getAllByText(/^Extensions:/)).toHaveLength(1)
  })

  it('shows whether each platform is on', () => {
    render(<PlatformSettings platforms={PLATFORMS} onSetUpEmulator={vi.fn()} />)

    expect(platformSwitch('Nintendo 64')).toBeChecked()
    expect(platformSwitch('PlayStation')).not.toBeChecked()
  })

  it('turns a platform off and on again when clicked', async () => {
    render(<PlatformSettings platforms={PLATFORMS} onSetUpEmulator={vi.fn()} />)
    const user = userEvent.setup()

    await user.click(platformSwitch('Nintendo 64'))
    expect(platformSwitch('Nintendo 64')).not.toBeChecked()

    await user.click(platformSwitch('Nintendo 64'))
    expect(platformSwitch('Nintendo 64')).toBeChecked()
  })

  it('scrolls the list to show the platform that takes focus', async () => {
    renderWithNavigation(<PlatformSettings platforms={PLATFORMS} onSetUpEmulator={vi.fn()} />)
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
    renderWithNavigation(<PlatformSettings platforms={PLATFORMS} onSetUpEmulator={vi.fn()} />)
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

  it('turns the focused platform on with confirm', async () => {
    renderWithNavigation(<PlatformSettings platforms={PLATFORMS} onSetUpEmulator={vi.fn()} />)
    const user = userEvent.setup()
    await user.pointer({ target: platformSwitch('PlayStation'), coords: { x: 10, y: 10 } })

    await user.keyboard('{Enter}')

    expect(platformSwitch('PlayStation')).toBeChecked()
    expect(platformSwitch('Nintendo 64')).toBeChecked()
  })
})
