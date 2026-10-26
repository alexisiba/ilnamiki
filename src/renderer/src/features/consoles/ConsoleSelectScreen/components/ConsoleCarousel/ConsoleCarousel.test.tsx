import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { getPlayedSounds } from '@renderer/test/audio'
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
function renderCarousel(onOpenConsole = vi.fn()): void {
  renderWithNavigation(<ConsoleCarousel consoles={CONSOLES} onOpenConsole={onOpenConsole} />)
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

  it('leaves out what isn’t known about a console, and the line when nothing is', () => {
    const unknown: GameConsole = {
      id: 'quake_3',
      name: 'Quake III',
      manufacturer: 'id Software',
      releaseYear: null,
      imageUrl: null,
      gameCount: 2
    }
    renderWithNavigation(
      <ConsoleCarousel
        consoles={[unknown, { ...unknown, id: 'other', name: 'Other', manufacturer: null }]}
        onOpenConsole={vi.fn()}
      />
    )

    expect(consoleButton('Quake III')).toHaveAccessibleDescription('id Software 2 games installed')
  })

  it('shows a console without a render as an unavailable image, still named by the console', () => {
    renderWithNavigation(
      <ConsoleCarousel consoles={[{ ...CONSOLES[0], imageUrl: null }]} onOpenConsole={vi.fn()} />
    )

    expect(consoleButton('PlayStation')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('selects the next console on right', async () => {
    renderCarousel()

    await userEvent.setup().keyboard('{ArrowRight}')

    expect(consoleButton('GameCube')).toHaveFocus()
    expect(consoleButton('GameCube')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('Nintendo · 2001')).toBeInTheDocument()
    expect(screen.getByText('1 game installed')).toBeInTheDocument()
  })

  it('sounds a slide, not a move, when the selection changes', async () => {
    renderCarousel()

    await userEvent.setup().keyboard('{ArrowRight}{ArrowRight}')

    expect(getPlayedSounds()).toEqual(['carousel-slide', 'cant-move'])
  })

  it('sounds a slide when a console beside the selection is clicked, and a select when it opens', async () => {
    renderCarousel()
    const user = userEvent.setup()

    await user.click(consoleButton('GameCube'))
    await user.click(consoleButton('GameCube'))

    expect(getPlayedSounds()).toEqual(['carousel-slide', 'select'])
  })

  it('stays on the first console on left instead of wrapping', async () => {
    renderCarousel()

    await userEvent.setup().keyboard('{ArrowLeft}')

    expect(consoleButton('PlayStation')).toHaveFocus()
    expect(consoleButton('PlayStation')).toHaveAttribute('aria-current', 'true')
  })

  it('selects a console beside the selection when it is clicked, without opening it', async () => {
    const onOpenConsole = vi.fn()
    renderCarousel(onOpenConsole)

    await userEvent.setup().click(consoleButton('GameCube'))

    expect(consoleButton('GameCube')).toHaveFocus()
    expect(consoleButton('GameCube')).toHaveAttribute('aria-current', 'true')
    expect(onOpenConsole).not.toHaveBeenCalled()
  })

  it('opens the selected console when it is clicked', async () => {
    const onOpenConsole = vi.fn()
    renderCarousel(onOpenConsole)

    await userEvent.setup().click(consoleButton('PlayStation'))

    expect(onOpenConsole).toHaveBeenCalledExactlyOnceWith('ps1')
  })

  it('opens the selected console on confirm', async () => {
    const onOpenConsole = vi.fn()
    renderCarousel(onOpenConsole)
    const user = userEvent.setup()

    await user.keyboard('{ArrowRight}')
    await user.keyboard('{Enter}')

    expect(onOpenConsole).toHaveBeenCalledExactlyOnceWith('gc')
  })

  it('keeps the selected console when the pointer moves over another one', async () => {
    renderCarousel()

    await userEvent.setup().hover(consoleButton('GameCube'))

    expect(consoleButton('PlayStation')).toHaveFocus()
    expect(consoleButton('PlayStation')).toHaveAttribute('aria-current', 'true')
  })
})
