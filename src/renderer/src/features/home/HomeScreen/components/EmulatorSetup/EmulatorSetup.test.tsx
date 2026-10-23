import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { setRect } from '@renderer/test/layout'
import { renderWithNavigation } from '@renderer/test/renderWithNavigation'

import { EmulatorSetup } from './EmulatorSetup'

const download = (): HTMLElement => screen.getByRole('button', { name: 'Download RetroArch' })
const alreadyInstalled = (): HTMLElement =>
  screen.getByRole('button', { name: 'I already have an emulator installed' })

/** Renders the panel with its actions stacked vertically, as on screen. */
function renderEmulatorSetup(): void {
  renderWithNavigation(<EmulatorSetup />)
  setRect(download(), { left: 0, top: 0, width: 400, height: 60 })
  setRect(alreadyInstalled(), { left: 0, top: 80, width: 400, height: 60 })
}

describe('EmulatorSetup', () => {
  it('focuses the download action first', () => {
    renderEmulatorSetup()

    expect(download()).toHaveFocus()
  })

  it('moves focus down and up with the keyboard', async () => {
    const user = userEvent.setup()
    renderEmulatorSetup()

    await user.keyboard('{ArrowDown}')
    expect(alreadyInstalled()).toHaveFocus()

    await user.keyboard('{ArrowUp}')
    expect(download()).toHaveFocus()
  })

  it('stays on the edges instead of wrapping', async () => {
    const user = userEvent.setup()
    renderEmulatorSetup()

    await user.keyboard('{ArrowUp}')
    expect(download()).toHaveFocus()

    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(alreadyInstalled()).toHaveFocus()
  })

  it('focuses the action the mouse points at', async () => {
    renderEmulatorSetup()

    await userEvent.setup().hover(alreadyInstalled())

    expect(alreadyInstalled()).toHaveFocus()
  })
})
