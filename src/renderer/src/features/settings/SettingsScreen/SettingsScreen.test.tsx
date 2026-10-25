import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { ADD_EMULATOR_PATH, NavigationProvider, SECTION_PATHS } from '@renderer/core/navigation'
import { setRect } from '@renderer/test/layout'

import { SettingsScreen } from './SettingsScreen'

const emulatorsTab = (): HTMLElement => screen.getByRole('tab', { name: 'Emulators' })
const addEmulator = (): HTMLElement => screen.getByRole('button', { name: 'Add emulator' })

/** Renders Settings at `path`, with a stand-in for the add emulator form inside it. */
function renderSettings(path: string = SECTION_PATHS.settings): void {
  const router = createMemoryRouter(
    [
      {
        path: SECTION_PATHS.settings,
        element: (
          <NavigationProvider>
            <SettingsScreen />
          </NavigationProvider>
        ),
        children: [
          { path: ADD_EMULATOR_PATH, element: <button type="button">Add emulator form</button> }
        ]
      }
    ],
    { initialEntries: [path] }
  )
  render(<RouterProvider router={router} />)
}

/**
 * Lays out the screen as on screen: the categories column on the left and, on the right, the
 * emulators content with Add emulator at the bottom. There are no sample emulators yet.
 */
function layOut(): void {
  setRect(screen.getByRole('tablist').parentElement!, { left: 0, top: 0, width: 320, height: 800 })
  setRect(emulatorsTab(), { left: 0, top: 0, width: 320, height: 70 })
  setRect(addEmulator().parentElement!.parentElement!, {
    left: 360,
    top: 0,
    width: 1400,
    height: 800
  })
  setRect(addEmulator(), { left: 1520, top: 700, width: 240, height: 60 })
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
    layOut()
    const user = userEvent.setup()

    await user.keyboard('{ArrowRight}')
    expect(addEmulator()).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(emulatorsTab()).toHaveFocus()
  })

  it('returns to the category on back from the content', async () => {
    renderSettings()
    layOut()
    const user = userEvent.setup()

    await user.keyboard('{ArrowRight}')
    await user.keyboard('{Escape}')

    expect(emulatorsTab()).toHaveFocus()
  })

  it('opens the form to add an emulator in the content panel, keeping the categories', async () => {
    renderSettings()

    await userEvent.setup().click(addEmulator())

    expect(screen.getByRole('tabpanel', { name: 'Emulators' })).toHaveTextContent(
      'Add emulator form'
    )
    expect(emulatorsTab()).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.queryByRole('heading', { name: 'No emulators configured' })
    ).not.toBeInTheDocument()
  })

  it('leaves the categories alone on back inside a screen of Settings', async () => {
    renderSettings(ADD_EMULATOR_PATH)
    const user = userEvent.setup()
    const form = screen.getByRole('button', { name: 'Add emulator form' })
    await user.click(form)

    await user.keyboard('{Escape}')

    expect(form).toHaveFocus()
  })
})
