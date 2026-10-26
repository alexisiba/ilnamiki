import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { mockEmulators } from '@renderer/test/api'
import type { Emulator } from '@renderer/types/emulator'

import { EmulatorSettings } from './EmulatorSettings'

const RETROARCH: Emulator = {
  id: 'a1',
  kind: 'retroarch',
  name: 'RetroArch',
  executablePath: '/home/player/Emulators/RetroArch-Linux-x86_64.AppImage',
  version: '1.22.2',
  iconDataUrl: 'data:image/svg+xml;base64,PHN2Zy8+',
  addedAt: 1_800_000_000_000
}

const UNKNOWN: Emulator = {
  id: 'b2',
  kind: 'unknown',
  name: 'My emulator',
  executablePath: '/home/player/Emulators/My-Emulator.AppImage',
  version: null,
  iconDataUrl: null,
  addedAt: 1_800_000_000_001
}

const emptyTitle = (): HTMLElement | null =>
  screen.queryByRole('heading', { level: 2, name: 'No emulators configured' })

describe('EmulatorSettings', () => {
  it('shows one item per emulator the user added, named by its name and described by its version', async () => {
    mockEmulators([RETROARCH, UNKNOWN])
    render(<EmulatorSettings onAdd={vi.fn()} onOpen={vi.fn()} />)

    const [first, second] = await screen.findAllByRole('listitem')
    expect(within(first).getByRole('button')).toHaveAccessibleName('RetroArch')
    expect(within(first).getByRole('button')).toHaveAccessibleDescription('Version 1.22.2')
    expect(within(second).getByRole('button')).toHaveAccessibleName('My emulator')
  })

  it('leaves the version out for an emulator that reports none', async () => {
    mockEmulators([UNKNOWN])
    render(<EmulatorSettings onAdd={vi.fn()} onOpen={vi.fn()} />)

    const item = await screen.findByRole('button', { name: 'My emulator' })
    expect(item).toHaveAccessibleDescription('')
    expect(screen.queryByText(/^Version/)).not.toBeInTheDocument()
  })

  it('has no heading of its own, as the selected category names it', async () => {
    mockEmulators([RETROARCH])
    render(<EmulatorSettings onAdd={vi.fn()} onOpen={vi.fn()} />)

    await screen.findByRole('button', { name: 'RetroArch' })
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('says there are no emulators and how to add one when there are none', async () => {
    mockEmulators([])
    render(<EmulatorSettings onAdd={vi.fn()} onOpen={vi.fn()} />)

    expect(await screen.findByText(/Select Add emulator/)).toBeInTheDocument()
    expect(emptyTitle()).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('shows neither the list nor the empty view until the emulators are read', () => {
    mockEmulators([])
    render(<EmulatorSettings onAdd={vi.fn()} onOpen={vi.fn()} />)

    expect(emptyTitle()).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add emulator' })).toBeInTheDocument()
  })

  it('says so when the emulators cannot be read', async () => {
    mockEmulators(new Error('No database'))
    render(<EmulatorSettings onAdd={vi.fn()} onOpen={vi.fn()} />)

    expect(
      await screen.findByRole('heading', { name: "The emulators couldn't be loaded" })
    ).toBeInTheDocument()
    expect(emptyTitle()).not.toBeInTheDocument()
  })

  it('has no Back button, as the main content of its category', async () => {
    mockEmulators([RETROARCH])
    render(<EmulatorSettings onAdd={vi.fn()} onOpen={vi.fn()} />)

    await screen.findByRole('button', { name: 'RetroArch' })
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
  })

  it('opens an emulator’s details when it is clicked', async () => {
    mockEmulators([RETROARCH, UNKNOWN])
    const onOpen = vi.fn()
    render(<EmulatorSettings onAdd={vi.fn()} onOpen={onOpen} />)

    await userEvent.setup().click(await screen.findByRole('button', { name: 'My emulator' }))

    expect(onOpen).toHaveBeenCalledWith(UNKNOWN.id)
  })

  it('opens the form to add one when Add emulator is clicked', async () => {
    const onAdd = vi.fn()
    render(<EmulatorSettings onAdd={onAdd} onOpen={vi.fn()} />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Add emulator' }))

    expect(onAdd).toHaveBeenCalledOnce()
  })
})
