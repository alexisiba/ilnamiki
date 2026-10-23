import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { setRect } from '@renderer/test/layout'
import { renderWithNavigation } from '@renderer/test/renderWithNavigation'

import { GameShelf } from './GameShelf'
import type { ShelfGame } from './GameShelf.types'

const GAMES: ShelfGame[] = [
  {
    id: 'dk-64',
    title: 'Donkey Kong 64',
    platform: 'Nintendo 64',
    imageUrl: 'dk.jpg',
    caption: 'Yesterday'
  },
  {
    id: 'mgs-ps1',
    title: 'Metal Gear Solid',
    platform: 'PlayStation',
    imageUrl: 'mgs.jpg'
  }
]

describe('GameShelf', () => {
  it('shows the section heading', () => {
    render(<GameShelf id="recent" title="Play again" games={GAMES} onSelectGame={vi.fn()} />)

    expect(screen.getByRole('heading', { level: 2, name: 'Play again' })).toBeInTheDocument()
  })

  it('shows one card per game, in order, named by title and described by platform', () => {
    render(<GameShelf id="recent" title="Play again" games={GAMES} onSelectGame={vi.fn()} />)

    const [first, second] = screen.getAllByRole('listitem')
    expect(within(first).getByRole('button')).toHaveAccessibleName('Donkey Kong 64')
    expect(within(first).getByRole('button')).toHaveAccessibleDescription('Nintendo 64 Yesterday')
    expect(within(second).getByRole('button')).toHaveAccessibleName('Metal Gear Solid')
    expect(within(second).getByRole('button')).toHaveAccessibleDescription('PlayStation')
  })

  it('focuses the next card on right', async () => {
    renderWithNavigation(
      <GameShelf id="recent" title="Play again" games={GAMES} onSelectGame={vi.fn()} />
    )
    const [first, second] = screen.getAllByRole('button')
    setRect(first, { left: 0, top: 0, width: 320, height: 240 })
    setRect(second, { left: 352, top: 0, width: 320, height: 240 })

    await userEvent.setup().keyboard('{ArrowRight}')

    expect(second).toHaveFocus()
  })

  it('keeps the focused card pinned to the start of the shelf', async () => {
    renderWithNavigation(
      <GameShelf id="recent" title="Play again" games={GAMES} onSelectGame={vi.fn()} />
    )
    const rail = screen.getByRole('list')
    const [first, second] = screen.getAllByRole('button')
    Object.defineProperty(rail, 'scrollWidth', { value: 704 })
    Object.defineProperty(rail, 'clientWidth', { value: 500 })
    setRect(rail, { left: 0, top: 0, width: 500, height: 240 })
    setRect(first, { left: 0, top: 0, width: 320, height: 240 })
    setRect(second, { left: 352, top: 0, width: 320, height: 240 })
    const scrollTo = vi.spyOn(rail, 'scrollTo')

    await userEvent.setup().keyboard('{ArrowRight}')

    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ left: 352 }))
  })

  it('selects a game when its card is clicked or confirmed', async () => {
    const onSelectGame = vi.fn()
    renderWithNavigation(
      <GameShelf id="recent" title="Play again" games={GAMES} onSelectGame={onSelectGame} />
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Metal Gear Solid' }))
    expect(onSelectGame).toHaveBeenLastCalledWith('mgs-ps1')

    await user.pointer({
      target: screen.getByRole('button', { name: 'Donkey Kong 64' }),
      coords: { x: 10, y: 10 }
    })
    await user.keyboard('{Enter}')
    expect(onSelectGame).toHaveBeenLastCalledWith('dk-64')
  })

  it('shows the caption only for games that have one', () => {
    render(<GameShelf id="recent" title="Play again" games={GAMES} onSelectGame={vi.fn()} />)

    const [first, second] = screen.getAllByRole('listitem')
    expect(within(first).getByText('Yesterday')).toBeInTheDocument()
    expect(within(second).queryByText('Yesterday')).not.toBeInTheDocument()
  })
})
