import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { GameDetails, InstalledPlatform } from '@shared/api'

import { GAME_DETAILS_PATH, NavigationProvider } from '@renderer/core/navigation'
import {
  emitGameEnded,
  emitMetadataChanged,
  mockGameDetails,
  mockLaunchGame,
  mockPlatforms,
  NO_GAME_FACTS
} from '@renderer/test/api'
import { setRect } from '@renderer/test/layout'

import { GameDetailsScreen } from './GameDetailsScreen'

const NOW = new Date('2026-10-22T18:00:00Z')
const MINUTE_MS = 60 * 1000

const PLAYSTATION: InstalledPlatform = {
  id: 'playstation',
  name: 'Sony - PlayStation',
  manufacturer: 'Sony',
  emulators: [
    {
      emulatorId: 'a1',
      emulatorName: 'RetroArch',
      optionId: 'swanstation',
      optionName: 'SwanStation',
      extensions: []
    }
  ],
  isEnabled: true,
  defaultEmulator: null
}

const CRASH: GameDetails = {
  id: 'g1',
  title: 'Crash Bandicoot (USA)',
  platformId: 'playstation',
  ...NO_GAME_FACTS,
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

const play = (): Promise<HTMLElement> => screen.findByRole('button', { name: 'Play now' })

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

  it('lists what the game’s metadata knows, in one line', async () => {
    mockGameDetails({
      ...CRASH,
      releaseYear: 1996,
      genre: 'Platform',
      developer: 'Naughty Dog',
      publisher: 'Sony',
      players: 1
    })
    renderDetailsOf('g1')

    expect(await screen.findByText('1996 · Platform · Naughty Dog · 1 player')).toBeInTheDocument()
    expect(screen.queryByText('No metadata')).not.toBeInTheDocument()
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

  it('focuses Play now', async () => {
    mockGameDetails(CRASH)
    renderDetailsOf('g1')

    expect(await play()).toHaveFocus()
  })

  it('shows a generic screenshot behind the game, as decoration', async () => {
    mockGameDetails(CRASH)
    renderDetailsOf('g1')

    await play()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    const images = [...document.querySelectorAll('img')]
    expect(images).toHaveLength(1)
    expect(images[0].src).toContain('no-bg-image')
  })

  it('shows the game’s metadata as soon as it is found, not when another game’s is', async () => {
    mockGameDetails(CRASH)
    renderDetailsOf('g1')
    await screen.findByText('No metadata')

    act(() => emitMetadataChanged('g2'))
    expect(window.api.games.getDetails).toHaveBeenCalledOnce()

    mockGameDetails({ ...CRASH, title: 'Crash Bandicoot', releaseYear: 1996 })
    act(() => emitMetadataChanged('g1'))

    expect(await screen.findByRole('heading', { level: 1, name: 'Crash Bandicoot' })).toBeVisible()
    expect(screen.getByText('1996')).toBeInTheDocument()
  })

  it('shows the game’s screenshot behind it once it has one', async () => {
    const screenshot = 'ilnamiki-artwork://game/g1/screenshot?v=1'
    mockGameDetails({ ...CRASH, artwork: { ...CRASH.artwork, screenshot } })
    renderDetailsOf('g1')

    await play()
    expect(document.querySelector('img')?.getAttribute('src')).toBe(screenshot)
  })

  it('starts the game with Play now, which reads Playing until it ends', async () => {
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

  it('opens the game’s options with Options, beside Play now', async () => {
    mockGameDetails(CRASH)
    renderDetailsOf('g1')
    const user = userEvent.setup()
    const playNow = await play()
    const options = screen.getByRole('button', { name: 'Options' })
    setRect(playNow, { left: 0, top: 0, width: 240, height: 60 })
    setRect(options, { left: 256, top: 0, width: 160, height: 60 })

    await user.keyboard('{ArrowRight}')
    expect(options).toHaveFocus()

    await user.keyboard('{Enter}')

    expect(await screen.findByRole('dialog', { name: 'Crash Bandicoot (USA)' })).toBeInTheDocument()
    expect(window.api.games.getPlayer).toHaveBeenCalledWith('g1')
  })

  it('opens the game’s options with the secondary action, keeping focus behind', async () => {
    mockGameDetails(CRASH)
    renderDetailsOf('g1')
    const user = userEvent.setup()
    const playNow = await play()

    await user.keyboard('x')
    expect(await screen.findByRole('dialog', { name: 'Crash Bandicoot (USA)' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(playNow).toHaveFocus()
  })

  it('says why the game couldn’t start, describing Play now', async () => {
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
    expect(screen.queryByRole('button', { name: 'Play now' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Options' })).not.toBeInTheDocument()
  })

  it('says so when the game can’t be read', async () => {
    mockGameDetails(new Error('No main'))
    renderDetailsOf('g1')

    expect(
      await screen.findByText("The game couldn't be loaded. Try again later.")
    ).toBeInTheDocument()
  })
})
