import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { ADD_EMULATOR_PATH, NavigationProvider, SECTION_PATHS } from '@renderer/core/navigation'
import { setRect } from '@renderer/test/layout'

import { SettingsScreen } from './SettingsScreen'

const emulatorsTab = (): HTMLElement => screen.getByRole('tab', { name: 'Emulators' })
const button = (name: string): HTMLElement => screen.getByRole('button', { name })

/**
 * Renders the screen laid out as on screen: the categories column on the left, and on the
 * right the emulators content with its Back and Add emulator buttons at the bottom. There
 * are no sample emulators yet.
 */
function renderSettings(): void {
  const router = createMemoryRouter(
    [
      {
        path: SECTION_PATHS.settings,
        element: (
          <NavigationProvider>
            <SettingsScreen />
          </NavigationProvider>
        )
      },
      { path: ADD_EMULATOR_PATH, element: <p>Add emulator form</p> }
    ],
    { initialEntries: [SECTION_PATHS.settings] }
  )
  render(<RouterProvider router={router} />)
  setRect(screen.getByRole('tablist').parentElement!, { left: 0, top: 0, width: 320, height: 800 })
  setRect(emulatorsTab(), { left: 0, top: 0, width: 320, height: 70 })
  setRect(button('Back').parentElement!.parentElement!, {
    left: 360,
    top: 0,
    width: 1400,
    height: 800
  })
  setRect(button('Back'), { left: 1300, top: 700, width: 200, height: 60 })
  setRect(button('Add emulator'), { left: 1520, top: 700, width: 240, height: 60 })
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
    expect(screen.getByRole('heading', { name: 'No emulators configured' })).toBeInTheDocument()
  })

  it('moves into the content on right and back to the category on left', async () => {
    renderSettings()
    const user = userEvent.setup()

    await user.keyboard('{ArrowRight}')
    expect(button('Back')).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(emulatorsTab()).toHaveFocus()
  })

  it('returns to the category on back from the content', async () => {
    renderSettings()
    const user = userEvent.setup()

    await user.keyboard('{ArrowRight}{ArrowRight}')
    await user.keyboard('{Escape}')

    expect(emulatorsTab()).toHaveFocus()
  })

  it('returns to the category with the Back button', async () => {
    renderSettings()

    await userEvent.setup().click(button('Back'))

    expect(emulatorsTab()).toHaveFocus()
  })

  it('opens the form to add an emulator', async () => {
    renderSettings()

    await userEvent.setup().click(button('Add emulator'))

    expect(screen.getByText('Add emulator form')).toBeInTheDocument()
  })
})
