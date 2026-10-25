import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EmulatorSettings } from './EmulatorSettings'

describe('EmulatorSettings', () => {
  it('shows the configured emulators section', () => {
    render(<EmulatorSettings onBack={vi.fn()} />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'Configured emulators' })
    ).toBeInTheDocument()
  })

  it('shows one item per emulator, named by its name and described by its version', () => {
    render(<EmulatorSettings onBack={vi.fn()} />)

    const [first, second] = screen.getAllByRole('listitem')
    expect(within(first).getByRole('button')).toHaveAccessibleName('RetroArch')
    expect(within(first).getByRole('button')).toHaveAccessibleDescription('Version 1.21.0')
    expect(within(second).getByRole('button')).toHaveAccessibleName('PCSX2')
    expect(within(second).getByRole('button')).toHaveAccessibleDescription('Version 2.2.0')
  })

  it('leaves when Back is clicked', async () => {
    const onBack = vi.fn()
    render(<EmulatorSettings onBack={onBack} />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Back' }))

    expect(onBack).toHaveBeenCalledOnce()
  })

  it('offers to add an emulator', () => {
    render(<EmulatorSettings onBack={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Add emulator' })).toBeInTheDocument()
  })
})
