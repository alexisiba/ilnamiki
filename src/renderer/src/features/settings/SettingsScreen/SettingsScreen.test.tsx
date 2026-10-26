import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import {
  ADD_EMULATOR_PATH,
  NavigationProvider,
  SECTION_PATHS,
  takeBackStep
} from '@renderer/core/navigation'
import { hasBackStep } from '@renderer/core/navigation/backNavigation'
import { getPlayedSounds } from '@renderer/test/audio'
import { setRect } from '@renderer/test/layout'

import { SettingsScreen } from './SettingsScreen'

// A first run: the API mock reports no emulators or installed platforms, and no game folders
// can be saved yet.

const emulatorsTab = (): HTMLElement => screen.getByRole('tab', { name: 'Emulators' })
const platformsTab = (): HTMLElement => screen.getByRole('tab', { name: 'Installed platforms' })
const gameFoldersTab = (): HTMLElement => screen.getByRole('tab', { name: 'Game folders' })
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
  setRect(platformsTab(), { left: 0, top: 80, width: 320, height: 70 })
  setRect(gameFoldersTab(), { left: 0, top: 160, width: 320, height: 70 })
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

  it('focuses the selected category, showing its content', async () => {
    renderSettings()

    expect(emulatorsTab()).toHaveFocus()
    expect(emulatorsTab()).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: 'Emulators' })).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'No emulators configured' })
    ).toBeInTheDocument()
  })

  it('enters the content only on confirm, not on right', async () => {
    renderSettings()
    layOut()
    const user = userEvent.setup()

    await user.keyboard('{ArrowRight}')
    expect(emulatorsTab()).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(addEmulator()).toHaveFocus()
    expect(getPlayedSounds()).toEqual(['cant-move', 'select'])
  })

  it('enters the content of the category clicked', async () => {
    renderSettings()
    const user = userEvent.setup()

    await user.click(platformsTab())

    expect(await screen.findByRole('button', { name: 'Set up an emulator' })).toHaveFocus()
  })

  it('stays in the content on left, until back returns to the category', async () => {
    renderSettings()
    layOut()
    const user = userEvent.setup()
    await user.keyboard('{Enter}')
    expect(hasBackStep()).toBe(true)

    await user.keyboard('{ArrowLeft}')
    expect(addEmulator()).toHaveFocus()

    act(() => {
      takeBackStep()
    })
    expect(emulatorsTab()).toHaveFocus()
    expect(hasBackStep()).toBe(false)
  })

  it('lists the categories in order', () => {
    renderSettings()

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Emulators',
      'Installed platforms',
      'Game folders'
    ])
  })

  it('shows the game folders when that category takes focus', async () => {
    renderSettings()
    layOut()

    await userEvent.setup().keyboard('{ArrowDown}{ArrowDown}')

    expect(gameFoldersTab()).toHaveFocus()
    expect(gameFoldersTab()).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: 'Game folders' })).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'No game folders configured' })
    ).toBeInTheDocument()
  })

  it('takes the user to the emulators from the empty game folders, with no core installed', async () => {
    renderSettings()
    layOut()
    const user = userEvent.setup()
    await user.keyboard('{ArrowDown}{ArrowDown}')

    await user.click(await screen.findByRole('button', { name: 'Set up an emulator' }))

    expect(emulatorsTab()).toHaveFocus()
    expect(screen.getByRole('heading', { name: 'No emulators configured' })).toBeInTheDocument()
  })

  it('shows the installed platforms when that category takes focus', async () => {
    renderSettings()
    layOut()

    await userEvent.setup().keyboard('{ArrowDown}')

    expect(platformsTab()).toHaveFocus()
    expect(platformsTab()).toHaveAttribute('aria-selected', 'true')
    expect(emulatorsTab()).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tabpanel', { name: 'Installed platforms' })).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'No platforms installed' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add emulator' })).not.toBeInTheDocument()
  })

  it('takes the user to the emulators from the empty installed platforms', async () => {
    renderSettings()
    layOut()
    const user = userEvent.setup()
    await user.keyboard('{ArrowDown}')

    await user.click(await screen.findByRole('button', { name: 'Set up an emulator' }))

    expect(emulatorsTab()).toHaveFocus()
    expect(emulatorsTab()).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: 'No emulators configured' })).toBeInTheDocument()
  })

  it('opens the form to add an emulator across the whole width, in place of the categories', async () => {
    renderSettings()

    await userEvent.setup().click(addEmulator())

    expect(screen.getByRole('button', { name: 'Add emulator form' })).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'No emulators configured' })
    ).not.toBeInTheDocument()
  })

  it('says which category a screen inside Settings belongs to', async () => {
    renderSettings()
    const user = userEvent.setup()
    await user.click(gameFoldersTab())

    await user.click(await screen.findByRole('button', { name: 'Set up an emulator' }))
    await user.click(addEmulator())

    expect(screen.getByText('Settings › Emulators')).toBeInTheDocument()
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
