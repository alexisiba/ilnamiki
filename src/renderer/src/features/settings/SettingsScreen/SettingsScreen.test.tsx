import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { ADD_EMULATOR_PATH, NavigationProvider, SECTION_PATHS } from '@renderer/core/navigation'
import { setRect } from '@renderer/test/layout'

import { SettingsScreen } from './SettingsScreen'

// A first run, whatever the sample data: no installed platforms or game folders. There are no
// emulators either: the API mock reports none.
vi.mock('@renderer/mocks/associatedPlatforms', () => ({ SAMPLE_ASSOCIATED_PLATFORMS: [] }))
vi.mock('@renderer/mocks/gameFolders', () => ({ SAMPLE_GAME_FOLDERS: [] }))

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

  it('moves into the content on right and back to the category on left', async () => {
    renderSettings()
    layOut()
    const user = userEvent.setup()

    await user.keyboard('{ArrowRight}')
    expect(addEmulator()).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(emulatorsTab()).toHaveFocus()
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
    expect(screen.getByRole('heading', { name: 'No game folders configured' })).toBeInTheDocument()
  })

  it('takes the user to the emulators from the empty game folders, with no core installed', async () => {
    renderSettings()
    layOut()
    const user = userEvent.setup()
    await user.keyboard('{ArrowDown}{ArrowDown}')

    await user.click(screen.getByRole('button', { name: 'Set up an emulator' }))

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
    expect(screen.getByRole('heading', { name: 'No platforms installed' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add emulator' })).not.toBeInTheDocument()
  })

  it('takes the user to the emulators from the empty installed platforms', async () => {
    renderSettings()
    layOut()
    const user = userEvent.setup()
    await user.keyboard('{ArrowDown}')

    await user.click(screen.getByRole('button', { name: 'Set up an emulator' }))

    expect(emulatorsTab()).toHaveFocus()
    expect(emulatorsTab()).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: 'No emulators configured' })).toBeInTheDocument()
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
