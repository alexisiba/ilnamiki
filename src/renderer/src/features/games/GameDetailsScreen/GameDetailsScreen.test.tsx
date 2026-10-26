import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { GameDetails, InstalledPlatform } from '@shared/api'

import { GAME_DETAILS_PATH, NavigationProvider } from '@renderer/core/navigation'
import { emitGameEnded, mockGameDetails, mockLaunchGame, mockPlatforms } from '@renderer/test/api'

import { GameDetailsScreen } from './GameDetailsScreen'

const NOW = new Date('2026-10-22T18:00:00Z')
const MINUTE_MS = 60 * 1000

const PLAYSTATION: InstalledPlatform = {
  id: 'playstation',
  name: 'Sony - PlayStation',
  manufacturer: 'Sony',
  cores: [{ id: 'swanstation', name: 'SwanStation', emulatorId: 'a1', extensions: [] }]
}

const CRASH: GameDetails = {
  id: 'g1',
  title: 'Crash Bandicoot (USA)',
  platformId: 'playstation',
  addedAt: 1,
  lastPlayedAt: null,
  playtimeMs: 0
}

const PLAYED_CRASH: GameDetails = {
  ...CRASH,
  lastPlayedAt: new Date('2026-10-19T18:00:00Z').getTime(),
  playtimeMs: (18 * 60 + 40) * MINUTE_MS
}

function renderDetailsOf(gameId: string): void {
  const router = createMemoryRouter(
    [
      {
        path: GAME_DETAILS_PATH,
        element: (
          <NavigationProvider>
            <GameDetailsScreen />
          </NavigationProvider>
        )
      }
    ],
    { initialEntries: [`/games/${gameId}`] }
  )
  render(<RouterProvider router={router} />)
}

const play = (): Promise<HTMLElement> => screen.findByRole('button', { name: 'Play' })

describe('GameDetailsScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
    mockPlatforms([PLAYSTATION])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the game as the main heading with its console, read for its id', async () => {
    mockGameDetails(CRASH)
    renderDetailsOf('g1')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Crash Bandicoot (USA)' })
    ).toBeInTheDocument()
    expect(window.api.games.getDetails).toHaveBeenCalledWith('g1')
    expect(await screen.findByText('PlayStation')).toBeInTheDocument()
  })

  it('says the game has no metadata or description yet', async () => {
    mockGameDetails(CRASH)
    renderDetailsOf('g1')

    expect(await screen.findByText('No metadata')).toBeInTheDocument()
    expect(screen.getByText('No description')).toBeInTheDocument()
  })

  it('says so while the game was never played', async () => {
    mockGameDetails(CRASH)
    renderDetailsOf('g1')

    expect(await screen.findByText('Not played yet')).toBeInTheDocument()
    expect(screen.queryByText(/Total playtime/)).not.toBeInTheDocument()
  })

  it('shows when a played game was last played and the total playtime', async () => {
    mockGameDetails(PLAYED_CRASH)
    renderDetailsOf('g1')

    expect(await screen.findByText('Last played 3 days ago')).toBeInTheDocument()
    expect(screen.getByText('Total playtime: 18 h 40 min')).toBeInTheDocument()
    expect(screen.queryByText('Not played yet')).not.toBeInTheDocument()
  })

  it('focuses the Play action', async () => {
    mockGameDetails(CRASH)
    renderDetailsOf('g1')

    expect(await play()).toHaveFocus()
  })

  it('treats the artwork as decorative', async () => {
    mockGameDetails(CRASH)
    renderDetailsOf('g1')

    await play()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('starts the game with Play, which reads Playing until it ends', async () => {
    mockGameDetails(CRASH)
    mockLaunchGame({ ok: true })
    renderDetailsOf('g1')
    await play()

    await userEvent.setup().keyboard('{Enter}')

    expect(window.api.games.launch).toHaveBeenCalledWith('g1')
    expect(screen.getByRole('button', { name: 'Playing' })).toHaveAttribute('aria-disabled', 'true')

    mockGameDetails(PLAYED_CRASH)
    act(() => emitGameEnded('g1'))

    expect(await play()).toHaveAttribute('aria-disabled', 'false')
    expect(await screen.findByText('Total playtime: 18 h 40 min')).toBeInTheDocument()
  })

  it('says why the game couldn’t start, describing Play', async () => {
    mockGameDetails(CRASH)
    mockLaunchGame({ ok: false, problem: 'missing-file' })
    renderDetailsOf('g1')

    await userEvent.setup().click(await play())

    const message = "The game's file isn't there anymore. Check its folder in Settings."
    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(await play()).toHaveAccessibleDescription(message)
  })

  it('says when the game is not in the library', async () => {
    renderDetailsOf('unknown-game')

    expect(await screen.findByText('This game is not in your library.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Play' })).not.toBeInTheDocument()
  })

  it('says so when the game can’t be read', async () => {
    mockGameDetails(new Error('No main'))
    renderDetailsOf('g1')

    expect(
      await screen.findByText("The game couldn't be loaded. Try again later.")
    ).toBeInTheDocument()
  })
})
