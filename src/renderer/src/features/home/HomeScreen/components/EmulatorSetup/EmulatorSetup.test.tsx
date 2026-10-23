import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { EmulatorSetup } from './EmulatorSetup'

const download = (): HTMLElement => screen.getByRole('button', { name: 'Download RetroArch' })
const alreadyInstalled = (): HTMLElement =>
  screen.getByRole('button', { name: 'I already have an emulator installed' })

describe('EmulatorSetup', () => {
  it('focuses the download action first', () => {
    render(<EmulatorSetup />)

    expect(download()).toHaveFocus()
  })

  it('moves focus down and up with the keyboard', async () => {
    const user = userEvent.setup()
    render(<EmulatorSetup />)

    await user.keyboard('{ArrowDown}')
    expect(alreadyInstalled()).toHaveFocus()

    await user.keyboard('{ArrowUp}')
    expect(download()).toHaveFocus()
  })

  it('stays on the edges instead of wrapping', async () => {
    const user = userEvent.setup()
    render(<EmulatorSetup />)

    await user.keyboard('{ArrowUp}')
    expect(download()).toHaveFocus()

    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(alreadyInstalled()).toHaveFocus()
  })

  it('focuses the action the mouse points at', async () => {
    render(<EmulatorSetup />)

    await userEvent.setup().hover(alreadyInstalled())

    expect(alreadyInstalled()).toHaveFocus()
  })
})
