import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

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
    for (const name of ['Shift', 'M', 'Shift', 'g', 's']) await user.click(key(name))

    expect(searchField()).toHaveValue('Mgs')
  })

  it('closes on back and returns focus to where it was', async () => {
    const button = renderWithFocusedButton()
    const user = userEvent.setup()

    await user.keyboard('y')
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(button).toHaveFocus()
  })

  it('closes on its action too, while focus is on the keyboard', async () => {
    render(<Search />)
    const user = userEvent.setup()

    await user.keyboard('y')
    await user.pointer({ target: key('k'), coords: { x: 10, y: 10 } })
    await user.keyboard('y')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens empty again after closing', async () => {
    render(<Search />)
    const user = userEvent.setup()

    await user.keyboard('y')
    await user.keyboard('metal{Escape}')
    await user.keyboard('y')

    expect(searchField()).toHaveValue('')
    expect(key('Shift')).toHaveAttribute('aria-pressed', 'false')
  })
})
