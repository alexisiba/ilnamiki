import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import type { Emulator, InspectEmulatorResult } from '@shared/api'

import { getEmulatorsState } from '@renderer/core/ipc/emulators'
import { ADD_EMULATOR_PATH, NavigationProvider, SECTION_PATHS } from '@renderer/core/navigation'
import {
  mockAddEmulator,
  mockEmulatorInspection,
  mockEmulators,
  mockPickedExecutable
} from '@renderer/test/api'

import { AddEmulatorSettings } from './AddEmulatorSettings'

const APPIMAGE = '/home/player/Emulators/RetroArch-Linux-x86_64.AppImage'

const RETROARCH_INSPECTION: InspectEmulatorResult = {
  ok: true,
  inspection: { kind: 'retroarch', name: 'RetroArch', version: '1.22.2', iconDataUrl: null }
}

const RETROARCH: Emulator = {
  id: 'a1',
  kind: 'retroarch',
  name: 'RetroArch',
  executablePath: APPIMAGE,
  version: '1.22.2',
  iconDataUrl: null,
  addedAt: 1_800_000_000_000
}

function renderAddEmulator(): void {
  const router = createMemoryRouter(
    [
      { path: SECTION_PATHS.settings, element: <p>Settings screen</p> },
      {
        path: ADD_EMULATOR_PATH,
        element: (
          <NavigationProvider>
            <AddEmulatorSettings />
          </NavigationProvider>
        )
      }
    ],
    { initialEntries: [ADD_EMULATOR_PATH] }
  )
  render(<RouterProvider router={router} />)
}

const nameField = (): HTMLElement => screen.getByRole('textbox', { name: 'Emulator name' })
const pathField = (): HTMLElement => screen.getByRole('textbox', { name: 'Application path' })
const browse = (): HTMLElement => screen.getByRole('button', { name: 'Choose the application' })

describe('AddEmulatorSettings', () => {
  it('shows the form title and that it is filled with a keyboard and mouse', () => {
    renderAddEmulator()

    expect(screen.getByRole('heading', { level: 2, name: 'Add emulator' })).toBeInTheDocument()
    expect(
      screen.getByText("You'll need a keyboard and mouse to fill in this form.")
    ).toBeInTheDocument()
  })

  it('asks for the application path first, then the name', () => {
    renderAddEmulator()

    const [first, second] = screen.getAllByRole('textbox')
    expect(first).toBe(pathField())
    expect(second).toBe(nameField())
  })

  it('focuses the path field, ready to type', async () => {
    renderAddEmulator()

    await userEvent.setup().keyboard('/usr/bin/retroarch')

    expect(pathField()).toHaveFocus()
    expect(pathField()).toHaveValue('/usr/bin/retroarch')
  })

  it('lets the name be typed', async () => {
    renderAddEmulator()
    const user = userEvent.setup()

    await user.click(nameField())
    await user.keyboard('RetroArch')

    expect(nameField()).toHaveValue('RetroArch')
  })

  it('fills the path with the file chosen in the file picker', async () => {
    mockPickedExecutable('/opt/RetroArch-Linux-x86_64.AppImage')
    renderAddEmulator()

    await userEvent.setup().click(browse())

    expect(pathField()).toHaveValue('/opt/RetroArch-Linux-x86_64.AppImage')
  })

  it('keeps the path when the file picker is cancelled', async () => {
    renderAddEmulator()
    const user = userEvent.setup()
    await user.click(pathField())
    await user.keyboard('/usr/bin/retroarch')

    mockPickedExecutable(null)
    await user.click(browse())

    expect(pathField()).toHaveValue('/usr/bin/retroarch')
  })

  it('says so when the file picker cannot open', async () => {
    mockPickedExecutable(new Error('No window'))
    renderAddEmulator()

    await userEvent.setup().click(browse())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "The picker couldn't open. Try again."
    )
    expect(pathField()).toHaveAccessibleDescription("The picker couldn't open. Try again.")
  })

  it('clears the error once the file picker opens again', async () => {
    mockPickedExecutable(new Error('No window'))
    renderAddEmulator()
    const user = userEvent.setup()
    await user.click(browse())
    await screen.findByRole('alert')

    mockPickedExecutable(APPIMAGE)
    mockEmulatorInspection(RETROARCH_INSPECTION)
    await user.click(browse())

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('returns to Settings with the Back button', async () => {
    renderAddEmulator()

    await userEvent.setup().click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByText('Settings screen')).toBeInTheDocument()
  })

  describe('detecting the emulator', () => {
    it('fills the name in from the application chosen in the picker', async () => {
      mockPickedExecutable(APPIMAGE)
      mockEmulatorInspection(RETROARCH_INSPECTION)
      renderAddEmulator()

      await userEvent.setup().click(browse())

      expect(window.api.emulators.inspect).toHaveBeenCalledWith(APPIMAGE)
      expect(await screen.findByDisplayValue('RetroArch')).toBe(nameField())
    })

    it('keeps a name the user typed', async () => {
      mockPickedExecutable(APPIMAGE)
      mockEmulatorInspection(RETROARCH_INSPECTION)
      renderAddEmulator()
      const user = userEvent.setup()
      await user.click(nameField())
      await user.keyboard('My RetroArch')

      await user.click(browse())

      expect(nameField()).toHaveValue('My RetroArch')
    })

    it('says at once why a chosen file cannot be an emulator', async () => {
      mockPickedExecutable('/home/player/notes.txt')
      mockEmulatorInspection({ ok: false, problem: 'unsupported-format' })
      renderAddEmulator()

      await userEvent.setup().click(browse())

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Only AppImages are supported for now.'
      )
      expect(pathField()).toBeInvalid()
    })

    it('forgets the problem once the path changes', async () => {
      mockPickedExecutable('/home/player/notes.txt')
      mockEmulatorInspection({ ok: false, problem: 'unsupported-format' })
      renderAddEmulator()
      const user = userEvent.setup()
      await user.click(browse())
      await screen.findByRole('alert')

      await user.click(pathField())
      await user.keyboard('x')

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('adding the emulator', () => {
    const addButton = (): HTMLElement => screen.getByRole('button', { name: 'Add emulator' })

    async function fillIn(path: string, name: string): Promise<void> {
      const user = userEvent.setup()
      await user.click(pathField())
      await user.keyboard(path)
      await user.click(nameField())
      await user.keyboard(name)
    }

    it('is unavailable until the path and the name are filled in', async () => {
      renderAddEmulator()
      expect(addButton()).toHaveAttribute('aria-disabled', 'true')

      await fillIn(APPIMAGE, 'RetroArch')

      expect(addButton()).toHaveAttribute('aria-disabled', 'false')
    })

    it('adds the emulator and returns to the list, which shows it', async () => {
      mockAddEmulator({ ok: true, emulator: RETROARCH })
      renderAddEmulator()
      await fillIn(APPIMAGE, ' RetroArch ')
      mockEmulators([RETROARCH])

      await userEvent.setup().click(addButton())

      expect(window.api.emulators.add).toHaveBeenCalledWith({
        executablePath: APPIMAGE,
        name: 'RetroArch'
      })
      expect(await screen.findByText('Settings screen')).toBeInTheDocument()
      expect(getEmulatorsState().emulators).toEqual([RETROARCH])
    })

    it('says why it cannot add the emulator and stays on the form', async () => {
      mockAddEmulator({ ok: false, problem: 'already-added' })
      renderAddEmulator()
      await fillIn(APPIMAGE, 'RetroArch')

      await userEvent.setup().click(addButton())

      expect(await screen.findByRole('alert')).toHaveTextContent('This emulator is already added.')
      expect(screen.queryByText('Settings screen')).not.toBeInTheDocument()
    })

    it('asks for the full path instead of sending a relative one', async () => {
      renderAddEmulator()
      await fillIn('RetroArch.AppImage', 'RetroArch')

      await userEvent.setup().click(addButton())

      expect(screen.getByRole('alert')).toHaveTextContent('Enter the full path to the application.')
      expect(window.api.emulators.add).not.toHaveBeenCalled()
    })

    it('says so when adding fails', async () => {
      mockAddEmulator(new Error('Database locked'))
      renderAddEmulator()
      await fillIn(APPIMAGE, 'RetroArch')

      await userEvent.setup().click(addButton())

      expect(await screen.findByRole('alert')).toHaveTextContent(
        "The emulator couldn't be saved. Try again."
      )
    })
  })
})
