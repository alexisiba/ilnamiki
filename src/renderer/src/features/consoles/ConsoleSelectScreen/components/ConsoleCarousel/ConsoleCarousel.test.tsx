import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { setRect } from '@renderer/test/layout'
import { renderWithNavigation } from '@renderer/test/renderWithNavigation'
import type { GameConsole } from '@renderer/types/console'

import { ConsoleCarousel } from './ConsoleCarousel'

const CONSOLES: GameConsole[] = [
  {
    id: 'ps1',
    name: 'PlayStation',
    manufacturer: 'Sony',
    releaseYear: 1994,
    imageUrl: 'ps1.png',
    gameCount: 24
  },
  {
    id: 'gc',
    name: 'GameCube',
    manufacturer: 'Nintendo',
    releaseYear: 2001,
    imageUrl: 'gc.png',
    gameCount: 1
  }
]

const consoleButton = (name: string): HTMLElement => screen.getByRole('button', { name })

/** Renders the carousel with the consoles laid out side by side, the first one centered. */
function renderCarousel(): void {
  renderWithNavigation(<ConsoleCarousel consoles={CONSOLES} />)
  setRect(consoleButton('PlayStation'), { left: 560, top: 0, width: 800, height: 530 })
  setRect(consoleButton('GameCube'), { left: 1200, top: 0, width: 480, height: 318 })
}

describe('ConsoleCarousel', () => {
  it('shows one console per item, named by the console', () => {
    renderCarousel()

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      'PlayStation',
      'GameCube'
    ])
  })

  it('selects and focuses the first console when it opens', () => {
    renderCarousel()

    expect(consoleButton('PlayStation')).toHaveFocus()
    expect(consoleButton('PlayStation')).toHaveAttribute('aria-current', 'true')
    expect(consoleButton('GameCube')).not.toHaveAttribute('aria-current')
  })

  it('describes the selected console by its maker, release year and installed games', () => {
    renderCarousel()

    expect(screen.getByText('Sony · 1994')).toBeInTheDocument()
    expect(screen.getByText('24 games installed')).toBeInTheDocument()
    expect(consoleButton('PlayStation')).toHaveAccessibleDescription(
      'Sony · 1994 24 games installed'
    )
  })

  it('selects the next console on right', async () => {
    renderCarousel()

    await userEvent.setup().keyboard('{ArrowRight}')

    expect(consoleButton('GameCube')).toHaveFocus()
    expect(consoleButton('GameCube')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('Nintendo · 2001')).toBeInTheDocument()
    expect(screen.getByText('1 game installed')).toBeInTheDocument()
  })

  it('stays on the first console on left instead of wrapping', async () => {
    renderCarousel()

    await userEvent.setup().keyboard('{ArrowLeft}')

    expect(consoleButton('PlayStation')).toHaveFocus()
    expect(consoleButton('PlayStation')).toHaveAttribute('aria-current', 'true')
  })

  it('selects a console when it is clicked', async () => {
    renderCarousel()

    await userEvent.setup().click(consoleButton('GameCube'))

    expect(consoleButton('GameCube')).toHaveFocus()
    expect(consoleButton('GameCube')).toHaveAttribute('aria-current', 'true')
  })

  it('keeps the selected console when the pointer moves over another one', async () => {
    renderCarousel()

    await userEvent.setup().hover(consoleButton('GameCube'))

    expect(consoleButton('PlayStation')).toHaveFocus()
    expect(consoleButton('PlayStation')).toHaveAttribute('aria-current', 'true')
  })
})
