import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'

import { emitInput } from '@renderer/core/input/inputBus'
import { setRect } from '@renderer/test/layout'

import { Search } from './Search'

/** The current path, so tests can tell where opening a game led. */
function CurrentPath(): React.JSX.Element {
  return <output aria-label="Path">{useLocation().pathname}</output>
}

/** Renders `ui` in a router on every path, next to the current path. */
function renderInRouter(ui: React.ReactNode): void {
  const router = createMemoryRouter([
    {
      path: '*',
      element: (
        <>
          {ui}
          <CurrentPath />
        </>
      )
    }
  ])
  render(<RouterProvider router={router} />)
}

/** Search next to a button that holds focus before it opens. */
function renderWithFocusedButton(): HTMLElement {
  renderInRouter(
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
    renderInRouter(<Search />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens on its action with the search field focused', async () => {
    renderInRouter(<Search />)

    await userEvent.setup().keyboard('y')

    expect(screen.getByRole('dialog', { name: 'Search' })).toBeInTheDocument()
    expect(searchField()).toHaveFocus()
  })

  it('types every letter into the field, including keys mapped to actions', async () => {
    renderInRouter(<Search />)
    const user = userEvent.setup()

    await user.keyboard('y')
    await user.keyboard('yeq x')

    expect(searchField()).toHaveValue('yeq x')
  })

  it('types into the field with the on-screen keyboard', async () => {
    renderInRouter(<Search />)
    const user = userEvent.setup()

    await user.keyboard('y')
    for (const name of ['Caps Lock', 'M', 'Caps Lock', 'g', 's']) await user.click(key(name))

    expect(searchField()).toHaveValue('Mgs')
  })

  it('shows a button guide over the blur, where back closes search', async () => {
    renderInRouter(<Search />)

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
    renderInRouter(<Search />)
    const user = userEvent.setup()

    await user.keyboard('y')
    await user.click(key('k'))
    // A gamepad: the physical Y types a "y" while focus is on the keys.
    act(() => emitInput('tertiary', 'xbox'))

    expect(screen.getByRole('dialog', { name: 'Search' })).toBeInTheDocument()
    expect(searchField()).toHaveValue('k ')
  })

  describe('searching', () => {
    const results = (): HTMLElement => screen.getByRole('region', { name: 'Results' })
    const result = (name: string): HTMLElement => within(results()).getByRole('button', { name })
    const keyboard = (): HTMLElement | null => screen.queryByRole('group', { name: 'Keyboard' })

    /** Opens search and searches `text`, typed in the field and submitted with Enter. */
    async function search(text: string): Promise<ReturnType<typeof userEvent.setup>> {
      const user = userEvent.setup()
      await user.keyboard('y')
      await user.keyboard(`${text}{Enter}`)
      return user
    }

    it('shows the matching games in place of the keyboard, focusing the first', async () => {
      renderInRouter(<Search />)

      await search('ON')

      const titles = within(results())
        .getAllByRole('button')
        .map((button) => button.textContent)
      expect(titles).toEqual([
        'Donkey Kong 64',
        'Spyro the Dragon',
        "Tony Hawk's Underground 2",
        'Monster Hunter Freedom Unite'
      ])
      expect(result('Donkey Kong 64')).toHaveFocus()
      expect(keyboard()).not.toBeInTheDocument()
    })

    it('searches with the action key of the on-screen keyboard too', async () => {
      renderInRouter(<Search />)
      const user = userEvent.setup()

      await user.keyboard('y')
      await user.keyboard('mario')
      await user.click(key('Search'))

      expect(result('Super Mario Bros. 3')).toHaveFocus()
    })

    it('describes the focused game by its facts', async () => {
      renderInRouter(<Search />)

      await search('spyro')

      expect(result('Spyro the Dragon')).toHaveAccessibleDescription(/1998 · Platformer/)
    })

    it('selects a game beside the selection when clicked', async () => {
      renderInRouter(<Search />)
      const user = await search('on')

      await user.click(result('Spyro the Dragon'))

      expect(result('Spyro the Dragon')).toHaveAttribute('aria-current', 'true')
      expect(screen.getByRole('dialog', { name: 'Search' })).toBeInTheDocument()
    })

    it('opens the confirmed game’s details and closes search', async () => {
      renderInRouter(<Search />)
      const user = await search('metal')

      await user.keyboard('{Enter}')

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.getByRole('status', { name: 'Path' })).toHaveTextContent('/games/mgs-ps1')
    })

    it('brings the keyboard back when the field is confirmed', async () => {
      renderInRouter(<Search />)
      const user = await search('metal')
      setRect(searchField(), { left: 0, top: 0, width: 960, height: 80 })
      setRect(result('Metal Gear Solid'), { left: 260, top: 200, width: 440, height: 400 })

      await user.keyboard('{ArrowUp}')
      expect(searchField()).toHaveFocus()
      await user.keyboard('{Enter}')

      expect(keyboard()).toBeInTheDocument()
      expect(screen.queryByRole('region', { name: 'Results' })).not.toBeInTheDocument()
      expect(searchField()).toHaveFocus()
      expect(searchField()).toHaveValue('metal')
    })

    it('brings the keyboard back when the field is clicked', async () => {
      renderInRouter(<Search />)
      const user = await search('metal')

      await user.click(searchField())

      expect(keyboard()).toBeInTheDocument()
    })

    it('brings the keyboard back when typing in the field', async () => {
      renderInRouter(<Search />)
      const user = await search('metal')

      act(() => searchField().focus())
      await user.keyboard('{Backspace}')

      expect(keyboard()).toBeInTheDocument()
      expect(searchField()).toHaveValue('meta')
    })

    it('keeps the keyboard and says so when no game matches', async () => {
      renderInRouter(<Search />)

      await search('  zzz ')

      expect(within(results()).getByRole('status')).toHaveTextContent('No games match “zzz”')
      expect(keyboard()).toBeInTheDocument()
      expect(searchField()).toHaveFocus()
    })

    it('does nothing when submitted empty', async () => {
      renderInRouter(<Search />)

      await search(' ')

      expect(screen.queryByRole('region', { name: 'Results' })).not.toBeInTheDocument()
      expect(keyboard()).toBeInTheDocument()
    })
  })

  it('opens empty again after closing', async () => {
    renderInRouter(<Search />)
    const user = userEvent.setup()

    await user.keyboard('y')
    await user.keyboard('metal{Escape}')
    await user.keyboard('y')

    expect(searchField()).toHaveValue('')
    expect(key('Caps Lock')).toHaveAttribute('aria-pressed', 'false')
  })
})
