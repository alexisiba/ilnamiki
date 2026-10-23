import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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
    render(<GameShelf title="Play again" games={GAMES} />)

    expect(screen.getByRole('heading', { level: 2, name: 'Play again' })).toBeInTheDocument()
  })

  it('shows one card per game, in order, with title and platform', () => {
    render(<GameShelf title="Play again" games={GAMES} />)

    const [first, second] = screen.getAllByRole('listitem')
    expect(within(first).getByRole('heading', { name: 'Donkey Kong 64' })).toBeInTheDocument()
    expect(within(first).getByText('Nintendo 64')).toBeInTheDocument()
    expect(within(second).getByRole('heading', { name: 'Metal Gear Solid' })).toBeInTheDocument()
    expect(within(second).getByText('PlayStation')).toBeInTheDocument()
  })

  it('shows the caption only for games that have one', () => {
    render(<GameShelf title="Play again" games={GAMES} />)

    const [first, second] = screen.getAllByRole('listitem')
    expect(within(first).getByText('Yesterday')).toBeInTheDocument()
    expect(within(second).queryByRole('paragraph')).not.toBeInTheDocument()
  })
})
