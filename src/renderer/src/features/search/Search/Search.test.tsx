import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { emitInput } from '@renderer/core/input/inputBus'

import { Search } from './Search'

/** Search next to a button that holds focus before it opens. */
function renderWithFocusedButton(): HTMLElement {
  render(
    <>
      <button type="button">Before</button>
      <Search />
    </>
  )
  const button = screen.getByRole('button', { name: 'Before' })
  button.focus()
  return button
}

const searchField = (): HTMLElement => screen.getByRole('searchbox', { name: 'Search games' })
const key = (name: string): HTMLElement =>
  within(screen.getByRole('group', { name: 'Keyboard' })).getByRole('button', { name })

describe('Search', () => {
  it('is closed until its action', () => {
    render(<Search />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens on its action with the search field focused', async () => {
    render(<Search />)

    await userEvent.setup().keyboard('y')

    expect(screen.getByRole('dialog', { name: 'Search' })).toBeInTheDocument()
    expect(searchField()).toHaveFocus()
  })

  it('types every letter into the field, including keys mapped to actions', async () => {
    render(<Search />)
    const user = userEvent.setup()

    await user.keyboard('y')
    await user.keyboard('yeq x')

    expect(searchField()).toHaveValue('yeq x')
  })

  it('types into the field with the on-screen keyboard', async () => {
    render(<Search />)
    const user = userEvent.setup()

    await user.keyboard('y')
    for (const name of ['Caps Lock', 'M', 'Caps Lock', 'g', 's']) await user.click(key(name))

    expect(searchField()).toHaveValue('Mgs')
  })

  it('shows a button guide over the blur, where back closes search', async () => {
    render(<Search />)

    await userEvent.setup().keyboard('y')

    const guide = within(screen.getByRole('dialog')).getByRole('contentinfo', {
      name: 'Controls'
    })
    expect(within(guide).getByText('Close')).toBeInTheDocument()
  })

  it('closes on back and returns focus to where it was', async () => {
    const button = renderWithFocusedButton()
    const user = userEvent.setup()

    await user.keyboard('y')
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(button).toHaveFocus()
  })

  it('types a space on its action instead of closing, while focus is on the keyboard', async () => {
    render(<Search />)
    const user = userEvent.setup()

    await user.keyboard('y')
    await user.click(key('k'))
    // A gamepad: the physical Y types a "y" while focus is on the keys.
    act(() => emitInput('tertiary', 'xbox'))

    expect(screen.getByRole('dialog', { name: 'Search' })).toBeInTheDocument()
    expect(searchField()).toHaveValue('k ')
  })

  it('opens empty again after closing', async () => {
    render(<Search />)
    const user = userEvent.setup()

    await user.keyboard('y')
    await user.keyboard('metal{Escape}')
    await user.keyboard('y')

    expect(searchField()).toHaveValue('')
    expect(key('Caps Lock')).toHaveAttribute('aria-pressed', 'false')
  })
})
