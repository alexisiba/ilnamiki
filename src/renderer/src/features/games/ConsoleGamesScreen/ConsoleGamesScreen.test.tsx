import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { FolderGame, GameFolder, InstalledPlatform } from '@shared/api'

import { startBackgroundMusic } from '@renderer/core/audio'
import { CONSOLE_GAMES_PATH, NavigationProvider } from '@renderer/core/navigation'
import {
  emitGameEnded,
  mockFolderGames,
  mockGameFolders,
  mockLaunchGame,
  mockPlatforms
} from '@renderer/test/api'
import { getPlayedSounds, isMusicPlaying } from '@renderer/test/audio'

import { ConsoleGamesScreen } from './ConsoleGamesScreen'

const PLAYSTATION: InstalledPlatform = {
  id: 'playstation',
  name: 'Sony - PlayStation',
  manufacturer: 'Sony',
  cores: [{ id: 'swanstation', name: 'SwanStation', emulatorId: 'a1', extensions: [] }],
  isEnabled: true,
  defaultCore: null
}

const PS1_FOLDER: GameFolder = {
  id: 'f1',
  path: '/home/player/Games/PS1',
  platformId: 'playstation',
  gameCount: 3,
  isAvailable: true,
  addedAt: 1
}

const GAMES: FolderGame[] = [
  { id: 'g1', title: 'Ape Escape (USA)', filePath: '/home/player/Games/PS1/Ape Escape (USA).chd' },
  { id: 'g2', title: 'Crash Bandicoot (USA)', filePath: '/home/player/Games/PS1/Crash.cue' },
  { id: 'g3', title: 'Tekken 3 (USA)', filePath: '/home/player/Games/PS1/Tekken 3 (USA).chd' }
]

beforeEach(() => {
  mockPlatforms([PLAYSTATION])
  mockGameFolders([PS1_FOLDER])
  mockFolderGames(GAMES)
})

function renderGamesOf(consoleId: string): void {
  const router = createMemoryRouter(
    [
      {
        path: CONSOLE_GAMES_PATH,
        element: (
          <NavigationProvider>
            <ConsoleGamesScreen />
          </NavigationProvider>
        )
      }
    ],
    { initialEntries: [`/library/${consoleId}`] }
  )
  render(<RouterProvider router={router} />)
}

const selectedGame = (): HTMLElement =>
  screen.getAllByRole('button').find((button) => button.getAttribute('aria-current') === 'true')!

const playNow = (): Promise<HTMLElement> => screen.findByRole('button', { name: 'Play now' })

describe('ConsoleGamesScreen', () => {
  it('shows the console as the main heading with its games and release year', async () => {
    renderGamesOf('playstation')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'PlayStation' })
    ).toBeInTheDocument()
    expect(await screen.findByText('3 games installed · 1994')).toBeInTheDocument()
  })

  it('shows the games saved from the console’s folder, by their file’s title', async () => {
    renderGamesOf('playstation')
    await playNow()

    expect(window.api.library.listFolderGames).toHaveBeenCalledWith(PS1_FOLDER.id)
    for (const game of GAMES) {
      expect(screen.getByRole('button', { name: game.title })).toBeInTheDocument()
    }
  })

  it('shows a generic image for every game, as none has artwork yet', async () => {
    renderGamesOf('playstation')
    await playNow()

    // Decorative (the title names each game), so they have no role to query by.
    const images = [...document.querySelectorAll('img')]
    expect(images).toHaveLength(GAMES.length)
    expect(images.every((image) => image.src.includes('no-image'))).toBe(true)
  })

  it('selects the first game, saying it has no description and no facts yet', async () => {
    renderGamesOf('playstation')
    await playNow()

    expect(selectedGame()).toHaveAccessibleName('Ape Escape (USA)')
    expect(screen.getByText('No description')).toBeInTheDocument()
    expect(screen.queryByText(/player/)).not.toBeInTheDocument()
  })

  it('focuses Play now, described by the selected game and its position', async () => {
    renderGamesOf('playstation')

    expect(await playNow()).toHaveFocus()
    expect(await playNow()).toHaveAccessibleDescription('Ape Escape (USA), 1 of 3')
  })

  it('selects the next game on right, keeping focus on Play now', async () => {
    renderGamesOf('playstation')
    await playNow()

    await userEvent.setup().keyboard('{ArrowRight}')

    expect(selectedGame()).toHaveAccessibleName('Crash Bandicoot (USA)')
    expect(await playNow()).toHaveAccessibleDescription('Crash Bandicoot (USA), 2 of 3')
    expect(await playNow()).toHaveFocus()
  })

  it('stays on the first game on left and on the last game on right', async () => {
    renderGamesOf('playstation')
    await playNow()
    const user = userEvent.setup()

    await user.keyboard('{ArrowLeft}')
    expect(selectedGame()).toHaveAccessibleName('Ape Escape (USA)')

    await user.keyboard('{ArrowRight}'.repeat(4))
    expect(selectedGame()).toHaveAccessibleName('Tekken 3 (USA)')
  })

  it('sounds a slide each time the selected game changes, and none at either end', async () => {
    renderGamesOf('playstation')
    await playNow()
    const user = userEvent.setup()

    await user.keyboard('{ArrowLeft}' + '{ArrowRight}'.repeat(4))

    expect(getPlayedSounds().filter((sound) => sound === 'carousel-slide')).toHaveLength(2)
  })

  it('selects a game when it is clicked, keeping focus on Play now', async () => {
    renderGamesOf('playstation')
    await playNow()

    await userEvent.setup().click(screen.getByRole('button', { name: 'Crash Bandicoot (USA)' }))

    expect(selectedGame()).toHaveAccessibleName('Crash Bandicoot (USA)')
    expect(await playNow()).toHaveFocus()
  })

  describe('playing', () => {
    it('starts the selected game with Play now, which reads Playing until it ends', async () => {
      mockLaunchGame({ ok: true })
      renderGamesOf('playstation')
      const user = userEvent.setup()
      await playNow()
      await user.keyboard('{ArrowRight}')

      await user.keyboard('{Enter}')

      expect(window.api.games.launch).toHaveBeenCalledWith('g2')
      const playing = screen.getByRole('button', { name: 'Playing' })
      expect(playing).toHaveAttribute('aria-disabled', 'true')
      expect(playing).toHaveFocus()

      act(() => emitGameEnded('g2'))

      expect(await playNow()).toHaveAttribute('aria-disabled', 'false')
    })

    it('pauses the background music while the game is played', async () => {
      mockLaunchGame({ ok: true })
      startBackgroundMusic()
      renderGamesOf('playstation')

      await userEvent.setup().click(await playNow())
      expect(isMusicPlaying()).toBe(false)

      act(() => emitGameEnded('g1'))
      expect(isMusicPlaying()).toBe(true)
    })

    it('starts the game once while it is starting or being played', async () => {
      mockLaunchGame('pending')
      renderGamesOf('playstation')
      const user = userEvent.setup()
      await user.click(await playNow())

      await user.click(screen.getByRole('button', { name: 'Playing' }))

      expect(window.api.games.launch).toHaveBeenCalledOnce()
    })

    it('says why the game couldn’t start, describing Play now', async () => {
      mockLaunchGame({ ok: false, problem: 'missing-file' })
      renderGamesOf('playstation')

      await userEvent.setup().click(await playNow())

      const message = "The game's file isn't there anymore. Check its folder in Settings."
      expect(await screen.findByRole('alert')).toHaveTextContent(message)
      expect(await playNow()).toHaveAccessibleDescription(`Ape Escape (USA), 1 of 3 ${message}`)
    })

    it('says so when the game fails to reach main', async () => {
      mockLaunchGame(new Error('No main'))
      renderGamesOf('playstation')

      await userEvent.setup().click(await playNow())

      expect(await screen.findByRole('alert')).toHaveTextContent(
        "The game couldn't be started. Try again."
      )
    })
  })

  it('shows nothing until the console is known, so no message flashes', () => {
    vi.mocked(window.api.library.listFolders).mockReturnValue(new Promise(() => {}))
    renderGamesOf('playstation')

    expect(screen.queryByText('This console is not in your library.')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('shows a message for a console that is not in the library', async () => {
    renderGamesOf('dreamcast')

    expect(await screen.findByText('This console is not in your library.')).toBeInTheDocument()
  })

  it('says so when the games can’t be read', async () => {
    mockFolderGames(new Error('No database'))
    renderGamesOf('playstation')

    expect(
      await screen.findByText("The games couldn't be loaded. Try again later.")
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Play now' })).not.toBeInTheDocument()
  })
})
