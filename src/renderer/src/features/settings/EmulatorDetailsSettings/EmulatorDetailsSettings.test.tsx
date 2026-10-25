import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import type { Emulator } from '@shared/api'

import { getEmulatorsState } from '@renderer/core/ipc/emulators'
import {
  EMULATOR_DETAILS_PATH,
  getEmulatorDetailsPath,
  NavigationProvider,
  SECTION_PATHS
} from '@renderer/core/navigation'
import { mockChangeEmulatorPath, mockEmulators, mockPickedExecutable } from '@renderer/test/api'

import { EmulatorDetailsSettings } from './EmulatorDetailsSettings'

const RETROARCH: Emulator = {
  id: '33b85b34-3541-4897-bd70-49ed7143fcfd',
  kind: 'retroarch',
  name: 'RetroArch',
  executablePath: '/home/player/Emulators/RetroArch-Linux-x86_64.AppImage',
  version: '1.22.2',
  iconDataUrl: null,
  addedAt: 1_800_000_000_000
}

const MOVED_PATH = '/home/player/Apps/RetroArch-Linux-x86_64.AppImage'

function renderDetails(emulatorId: string = RETROARCH.id): void {
  const router = createMemoryRouter(
    [
      { path: SECTION_PATHS.settings, element: <p>Settings screen</p> },
      {
        path: EMULATOR_DETAILS_PATH,
        element: (
          <NavigationProvider>
            <EmulatorDetailsSettings />
          </NavigationProvider>
        )
      }
    ],
    { initialEntries: [getEmulatorDetailsPath(emulatorId)] }
  )
  render(<RouterProvider router={router} />)
}

const changePath = (): HTMLElement => screen.getByRole('button', { name: 'Change path' })
const remove = (): HTMLElement => screen.getByRole('button', { name: 'Remove emulator' })
const confirmation = (): HTMLElement | null =>
  screen.queryByRole('dialog', { name: 'Remove RetroArch?' })

describe('EmulatorDetailsSettings', () => {
  it('shows the emulator’s name as its title and its version below', async () => {
    mockEmulators([RETROARCH])
    renderDetails()

    expect(await screen.findByRole('heading', { level: 2, name: 'RetroArch' })).toBeInTheDocument()
    expect(screen.getByText('Version 1.22.2')).toBeInTheDocument()
  })

  it('leaves the version out when the emulator reports none', async () => {
    mockEmulators([{ ...RETROARCH, version: null }])
    renderDetails()

    await screen.findByRole('heading', { name: 'RetroArch' })
    expect(screen.queryByText(/^Version/)).not.toBeInTheDocument()
  })

  it('shows the application’s path, which Change path is described by', async () => {
    mockEmulators([RETROARCH])
    renderDetails()

    const path = await screen.findByRole('region', { name: 'Application path' })
    expect(within(path).getByText(RETROARCH.executablePath)).toBeInTheDocument()
    expect(changePath()).toHaveAccessibleDescription(RETROARCH.executablePath)
  })

  it('says so when the emulator is no longer there, with a way back', async () => {
    mockEmulators([])
    renderDetails()

    expect(
      await screen.findByRole('heading', { name: 'This emulator is no longer in Ilnamiki.' })
    ).toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByText('Settings screen')).toBeInTheDocument()
  })

  it('returns to the list with the Back button', async () => {
    mockEmulators([RETROARCH])
    renderDetails()

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Back' }))

    expect(screen.getByText('Settings screen')).toBeInTheDocument()
  })

  describe('changing the path', () => {
    it('saves the application chosen in the picker and shows its path', async () => {
      mockEmulators([RETROARCH])
      renderDetails()
      await screen.findByRole('heading', { name: 'RetroArch' })
      const moved = { ...RETROARCH, executablePath: MOVED_PATH }
      mockPickedExecutable(MOVED_PATH)
      mockChangeEmulatorPath({ ok: true, emulator: moved })
      mockEmulators([moved])

      await userEvent.setup().click(changePath())

      expect(window.api.emulators.changePath).toHaveBeenCalledWith({
        id: RETROARCH.id,
        executablePath: MOVED_PATH
      })
      expect(await screen.findByText(MOVED_PATH)).toBeInTheDocument()
    })

    it('changes nothing when the picker is cancelled or the same file is chosen', async () => {
      mockEmulators([RETROARCH])
      renderDetails()
      await screen.findByRole('heading', { name: 'RetroArch' })
      const user = userEvent.setup()

      mockPickedExecutable(null)
      await user.click(changePath())
      mockPickedExecutable(RETROARCH.executablePath)
      await user.click(changePath())

      expect(window.api.emulators.changePath).not.toHaveBeenCalled()
    })

    it('says why the chosen application can’t be used, keeping the path', async () => {
      mockEmulators([RETROARCH])
      renderDetails()
      await screen.findByRole('heading', { name: 'RetroArch' })
      mockPickedExecutable('/home/player/notes.txt')
      mockChangeEmulatorPath({ ok: false, problem: 'unsupported-format' })

      await userEvent.setup().click(changePath())

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Only AppImages are supported for now.'
      )
      expect(screen.getByText(RETROARCH.executablePath)).toBeInTheDocument()
    })
  })

  describe('removing the emulator', () => {
    it('asks first, with Cancel focused', async () => {
      mockEmulators([RETROARCH])
      renderDetails()

      await userEvent.setup().click(await screen.findByRole('button', { name: 'Remove emulator' }))

      expect(confirmation()).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
      expect(window.api.emulators.remove).not.toHaveBeenCalled()
    })

    it('keeps the emulator when the user cancels', async () => {
      mockEmulators([RETROARCH])
      renderDetails()
      const user = userEvent.setup()
      await user.click(await screen.findByRole('button', { name: 'Remove emulator' }))

      await user.keyboard('{Escape}')

      expect(confirmation()).not.toBeInTheDocument()
      expect(window.api.emulators.remove).not.toHaveBeenCalled()
      expect(remove()).toHaveFocus()
    })

    it('removes the emulator once confirmed and returns to the list', async () => {
      mockEmulators([RETROARCH])
      renderDetails()
      const user = userEvent.setup()
      await user.click(await screen.findByRole('button', { name: 'Remove emulator' }))
      mockEmulators([])

      await user.click(screen.getByRole('button', { name: 'Remove' }))

      expect(window.api.emulators.remove).toHaveBeenCalledWith(RETROARCH.id)
      expect(await screen.findByText('Settings screen')).toBeInTheDocument()
      expect(getEmulatorsState().emulators).toEqual([])
    })
  })
})
