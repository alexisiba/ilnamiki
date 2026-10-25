import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { ADD_EMULATOR_PATH, NavigationProvider, SECTION_PATHS } from '@renderer/core/navigation'
import { mockPickedExecutable } from '@renderer/test/api'

import { AddEmulatorScreen } from './AddEmulatorScreen'

function renderAddEmulator(): void {
  const router = createMemoryRouter(
    [
      { path: SECTION_PATHS.settings, element: <p>Settings screen</p> },
      {
        path: ADD_EMULATOR_PATH,
        element: (
          <NavigationProvider>
            <AddEmulatorScreen />
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

describe('AddEmulatorScreen', () => {
  it('shows the form title and that it is filled with a keyboard and mouse', () => {
    renderAddEmulator()

    expect(screen.getByRole('heading', { level: 1, name: 'Add emulator' })).toBeInTheDocument()
    expect(screen.getByText('Fill in this form with a keyboard and mouse.')).toBeInTheDocument()
  })

  it('focuses the name field, ready to type', async () => {
    renderAddEmulator()

    await userEvent.setup().keyboard('RetroArch')

    expect(nameField()).toHaveFocus()
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
      "The file picker couldn't open. Try again."
    )
    expect(pathField()).toHaveAccessibleDescription("The file picker couldn't open. Try again.")
  })

  it('clears the error once the file picker opens again', async () => {
    mockPickedExecutable(new Error('No window'))
    renderAddEmulator()
    const user = userEvent.setup()
    await user.click(browse())
    await screen.findByRole('alert')

    mockPickedExecutable('/usr/bin/retroarch')
    await user.click(browse())

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('returns to Settings with the Back button', async () => {
    renderAddEmulator()

    await userEvent.setup().click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByText('Settings screen')).toBeInTheDocument()
  })
})
