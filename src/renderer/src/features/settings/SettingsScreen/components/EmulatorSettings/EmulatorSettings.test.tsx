import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Emulator } from '@renderer/types/emulator'

import { EmulatorSettings } from './EmulatorSettings'

const EMULATORS: Emulator[] = [
  { id: 'retroarch', name: 'RetroArch', version: '1.21.0' },
  { id: 'pcsx2', name: 'PCSX2', version: '2.2.0' }
]

describe('EmulatorSettings', () => {
  it('shows the configured emulators section', () => {
    render(<EmulatorSettings emulators={EMULATORS} onAdd={vi.fn()} />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'Configured emulators' })
    ).toBeInTheDocument()
  })

  it('shows one item per emulator, named by its name and described by its version', () => {
    render(<EmulatorSettings emulators={EMULATORS} onAdd={vi.fn()} />)

    const [first, second] = screen.getAllByRole('listitem')
    expect(within(first).getByRole('button')).toHaveAccessibleName('RetroArch')
    expect(within(first).getByRole('button')).toHaveAccessibleDescription('Version 1.21.0')
    expect(within(second).getByRole('button')).toHaveAccessibleName('PCSX2')
    expect(within(second).getByRole('button')).toHaveAccessibleDescription('Version 2.2.0')
  })

  it('says there are no emulators and how to add one when there are none', () => {
    render(<EmulatorSettings emulators={[]} onAdd={vi.fn()} />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'No emulators configured' })
    ).toBeInTheDocument()
    expect(screen.getByText(/Select Add emulator/)).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Configured emulators' })).not.toBeInTheDocument()
  })

  it('has no Back button, as the main content of its category', () => {
    render(<EmulatorSettings emulators={EMULATORS} onAdd={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
  })

  it('opens the form to add one when Add emulator is clicked', async () => {
    const onAdd = vi.fn()
    render(<EmulatorSettings emulators={[]} onAdd={onAdd} />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Add emulator' }))

    expect(onAdd).toHaveBeenCalledOnce()
  })
})
