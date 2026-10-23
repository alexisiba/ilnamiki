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

  it('shows the on-screen keyboard with a Search key', async () => {
    render(<Search />)

    await userEvent.setup().keyboard('y')

    const keyboard = screen.getByRole('group', { name: 'Keyboard' })
    expect(within(keyboard).getByRole('button', { name: 'Search' })).toBeInTheDocument()
  })

  it('types every letter into the field, including keys mapped to actions', async () => {
    render(<Search />)
    const user = userEvent.setup()

    await user.keyboard('y')
    await user.keyboard('yeq x')

    expect(searchField()).toHaveValue('yeq x')
  })

  it('closes on back and returns focus to where it was', async () => {
    const button = renderWithFocusedButton()
    const user = userEvent.setup()

    await user.keyboard('y')
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(button).toHaveFocus()
  })
})
