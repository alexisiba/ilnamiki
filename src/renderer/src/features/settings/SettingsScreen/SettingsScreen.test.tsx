import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { setRect } from '@renderer/test/layout'
import { renderWithNavigation } from '@renderer/test/renderWithNavigation'

import { SettingsScreen } from './SettingsScreen'

const emulatorsTab = (): HTMLElement => screen.getByRole('tab', { name: 'Emulators' })
const emulator = (name: string): HTMLElement => screen.getByRole('button', { name })

/**
 * Renders the screen laid out as on screen: the categories column on the left, and on the
 * right the emulators stacked above the Back and Add emulator buttons.
 */
function renderSettings(): void {
  renderWithNavigation(<SettingsScreen />)
  setRect(screen.getByRole('tablist').parentElement!, { left: 0, top: 0, width: 320, height: 800 })
  setRect(emulatorsTab(), { left: 0, top: 0, width: 320, height: 70 })
  ;['RetroArch', 'PCSX2', 'Dolphin', 'PPSSPP'].forEach((name, index) => {
    setRect(emulator(name), { left: 360, top: 60 + index * 130, width: 1400, height: 114 })
  })
  setRect(emulator('Back'), { left: 1300, top: 700, width: 200, height: 60 })
  setRect(emulator('Add emulator'), { left: 1520, top: 700, width: 240, height: 60 })
}

describe('SettingsScreen', () => {
  it('names the screen with its main heading', () => {
    renderSettings()

    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument()
  })

  it('focuses the selected category, showing its content', () => {
    renderSettings()

    expect(emulatorsTab()).toHaveFocus()
    expect(emulatorsTab()).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: 'Emulators' })).toBeInTheDocument()
    expect(emulator('RetroArch')).toBeInTheDocument()
  })

  it('moves into the content on right and back to the category on left', async () => {
    renderSettings()
    const user = userEvent.setup()

    await user.keyboard('{ArrowRight}')
    expect(emulator('RetroArch')).toHaveFocus()

    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowLeft}')
    expect(emulatorsTab()).toHaveFocus()
  })

  it('returns to the category on back from the content', async () => {
    renderSettings()
    const user = userEvent.setup()

    await user.keyboard('{ArrowRight}{ArrowDown}')
    await user.keyboard('{Escape}')

    expect(emulatorsTab()).toHaveFocus()
  })

  it('returns to the category with the Back button', async () => {
    renderSettings()
    const user = userEvent.setup()

    await user.click(emulator('Back'))

    expect(emulatorsTab()).toHaveFocus()
  })

  it('reaches the actions below the emulators', async () => {
    renderSettings()
    const user = userEvent.setup()

    await user.keyboard('{ArrowRight}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}')

    expect(emulator('Back')).toHaveFocus()
  })
})
