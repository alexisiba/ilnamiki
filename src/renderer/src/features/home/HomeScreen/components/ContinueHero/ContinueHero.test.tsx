import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { emitGameEnded, mockLaunchGame } from '@renderer/test/api'
import { renderWithNavigation } from '@renderer/test/renderWithNavigation'

import { ContinueHero } from './ContinueHero'
import type { ContinueGame } from './ContinueHero.types'

const NOW = new Date('2026-10-22T18:00:00Z')

const DESCRIPTION = 'Travel through time as Link.'

const GAME: ContinueGame = {
  id: 'g1',
  title: 'The Legend of Zelda: Ocarina of Time',
  platform: 'Nintendo 64',
  description: DESCRIPTION,
  imageUrl: 'artwork.webp',
  lastPlayedAt: new Date('2026-10-20T18:00:00Z'),
  playtimeMinutes: 32 * 60 + 15
}

describe('ContinueHero', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the game as the main heading with its platform and description', () => {
    render(<ContinueHero game={GAME} />)

    expect(screen.getByRole('heading', { level: 1, name: GAME.title })).toBeInTheDocument()
    expect(screen.getByText('Nintendo 64')).toBeInTheDocument()
    expect(screen.getByText(DESCRIPTION)).toBeInTheDocument()
    expect(screen.getByText('Resume session')).toBeInTheDocument()
  })

  it('leaves the description out while the game has none', () => {
    render(<ContinueHero game={{ ...GAME, description: null }} />)

    expect(screen.queryByText(DESCRIPTION)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: GAME.title })).toBeInTheDocument()
  })

  it('shows when the game was last played and the total playtime', () => {
    render(<ContinueHero game={GAME} />)

    expect(screen.getByText('Last played 2 days ago')).toBeInTheDocument()
    expect(screen.getByText('Total playtime: 32 h 15 min')).toBeInTheDocument()
  })

  it('focuses the continue playing action', () => {
    renderWithNavigation(<ContinueHero game={GAME} />)

    expect(screen.getByRole('button', { name: 'Continue playing' })).toHaveFocus()
  })

  it('starts the game with Continue playing, which reads Playing until it ends', async () => {
    mockLaunchGame({ ok: true })
    renderWithNavigation(<ContinueHero game={GAME} />)

    await userEvent.setup().keyboard('{Enter}')

    expect(window.api.games.launch).toHaveBeenCalledWith('g1')
    const playing = screen.getByRole('button', { name: 'Playing' })
    expect(playing).toHaveAttribute('aria-disabled', 'true')
    expect(playing).toHaveFocus()

    act(() => emitGameEnded('g1'))

    expect(await screen.findByRole('button', { name: 'Continue playing' })).toHaveAttribute(
      'aria-disabled',
      'false'
    )
  })

  it('says why the game couldn’t start, describing Continue playing', async () => {
    mockLaunchGame({ ok: false, problem: 'no-core' })
    renderWithNavigation(<ContinueHero game={GAME} />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Continue playing' }))

    const message = 'No installed core plays this console. Set up an emulator in Settings.'
    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(screen.getByRole('button', { name: 'Continue playing' })).toHaveAccessibleDescription(
      message
    )
  })

  it('treats the artwork as decorative', () => {
    render(<ContinueHero game={GAME} />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
