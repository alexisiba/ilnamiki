import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { GamePlayer, PlatformEmulator } from '@shared/api'

import { mockGamePlayer } from '@renderer/test/api'

import { GameOptions } from './GameOptions'

const BEETLE: PlatformEmulator = {
  emulatorId: 'a1',
  emulatorName: 'RetroArch',
  optionId: 'mednafen_psx_hw',
  optionName: 'Beetle PSX HW',
  extensions: []
}
const SWANSTATION: PlatformEmulator = {
  emulatorId: 'a1',
  emulatorName: 'RetroArch',
  optionId: 'swanstation',
  optionName: 'SwanStation',
  extensions: []
}
const DUCKSTATION: PlatformEmulator = {
  emulatorId: 'b2',
  emulatorName: 'DuckStation',
  optionId: null,
  optionName: null,
  extensions: []
}

const PLAYER: GamePlayer = {
  emulators: [BEETLE, SWANSTATION],
  chosenEmulator: null,
  playsWith: { emulator: { emulatorId: 'a1', optionId: 'swanstation' }, reason: 'last-session' }
}

const CHOSEN_BEETLE = { emulatorId: 'a1', optionId: 'mednafen_psx_hw' }

function renderOptions(onClose = vi.fn()): void {
  render(<GameOptions gameId="g1" title="Crash Bandicoot (USA)" onClose={onClose} />)
}

const panel = (): Promise<HTMLElement> =>
  screen.findByRole('dialog', { name: 'Crash Bandicoot (USA)' })

describe('GameOptions', () => {
  it('opens a panel named by the game, reading its emulators', async () => {
    mockGamePlayer(PLAYER)
    renderOptions()

    expect(await panel()).toBeInTheDocument()
    expect(screen.getByText('Options')).toBeInTheDocument()
    expect(window.api.games.getPlayer).toHaveBeenCalledWith('g1')
  })

  it('says which emulator the game plays with, and why', async () => {
    mockGamePlayer(PLAYER)
    renderOptions()

    expect(
      await screen.findByText('Plays with RetroArch · SwanStation · last played with it')
    ).toBeInTheDocument()
  })

  it('offers Automatic and each emulator, Automatic marked and focused while none was chosen', async () => {
    mockGamePlayer(PLAYER)
    renderOptions()

    const emulators = await screen.findByRole('radiogroup', { name: 'Emulator' })
    const choices = within(emulators).getAllByRole('radio')
    expect(choices.map((choice) => choice.textContent)).toEqual([
      "AutomaticThe emulator it was last played with, or the console's default",
      'RetroArch · Beetle PSX HW',
      'RetroArch · SwanStation'
    ])
    expect(choices[0]).toBeChecked()
    await waitFor(() => expect(choices[0]).toHaveFocus())
  })

  it('marks and focuses the emulator chosen for the game', async () => {
    mockGamePlayer({
      ...PLAYER,
      chosenEmulator: CHOSEN_BEETLE,
      playsWith: { emulator: CHOSEN_BEETLE, reason: 'game' }
    })
    renderOptions()

    const beetle = await screen.findByRole('radio', { name: 'RetroArch · Beetle PSX HW' })
    expect(beetle).toBeChecked()
    await waitFor(() => expect(beetle).toHaveFocus())
    expect(
      screen.getByText('Plays with RetroArch · Beetle PSX HW · chosen for this game')
    ).toBeInTheDocument()
  })

  it('keeps the emulator chosen for the game, then shows what it plays with', async () => {
    mockGamePlayer(PLAYER)
    renderOptions()
    const beetle = await screen.findByRole('radio', { name: 'RetroArch · Beetle PSX HW' })
    mockGamePlayer({
      ...PLAYER,
      chosenEmulator: CHOSEN_BEETLE,
      playsWith: { emulator: CHOSEN_BEETLE, reason: 'game' }
    })

    await userEvent.setup().click(beetle)

    expect(window.api.games.setEmulator).toHaveBeenCalledWith('g1', CHOSEN_BEETLE)
    expect(
      await screen.findByText('Plays with RetroArch · Beetle PSX HW · chosen for this game')
    ).toBeInTheDocument()
    expect(beetle).toBeChecked()
  })

  it('offers and keeps an emulator without options, named alone', async () => {
    mockGamePlayer({ ...PLAYER, emulators: [BEETLE, SWANSTATION, DUCKSTATION] })
    renderOptions()

    await userEvent.setup().click(await screen.findByRole('radio', { name: 'DuckStation' }))

    expect(window.api.games.setEmulator).toHaveBeenCalledWith('g1', {
      emulatorId: 'b2',
      optionId: null
    })
  })

  it('forgets the game’s emulator with Automatic', async () => {
    mockGamePlayer({ ...PLAYER, chosenEmulator: CHOSEN_BEETLE })
    renderOptions()

    await userEvent.setup().click(await screen.findByRole('radio', { name: /^Automatic/ }))

    expect(window.api.games.setEmulator).toHaveBeenCalledWith('g1', null)
  })

  it('keeps the mark where it was when the emulator can’t be kept, saying so', async () => {
    mockGamePlayer(PLAYER)
    vi.mocked(window.api.games.setEmulator).mockRejectedValue(new Error('No database'))
    renderOptions()

    await userEvent
      .setup()
      .click(await screen.findByRole('radio', { name: 'RetroArch · Beetle PSX HW' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "The emulator couldn't be saved. Try again."
    )
    expect(screen.getByRole('radio', { name: /^Automatic/ })).toBeChecked()
  })

  it('names the only emulator, with nothing to choose, focusing Close', async () => {
    mockGamePlayer({ ...PLAYER, emulators: [SWANSTATION] })
    renderOptions()

    expect(
      await screen.findByText('Plays with RetroArch · SwanStation · last played with it')
    ).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus())
  })

  it('says so when none of the user’s emulators plays the game', async () => {
    mockGamePlayer({ emulators: [], chosenEmulator: null, playsWith: null })
    renderOptions()

    expect(
      await screen.findByText('None of your emulators plays this console.')
    ).toBeInTheDocument()
  })

  it('says so when the game isn’t in the library', async () => {
    mockGamePlayer(null)
    renderOptions()
    expect(await screen.findByText('This game is no longer in your library.')).toBeInTheDocument()
  })

  it('says so when its options can’t be read', async () => {
    mockGamePlayer(new Error('No main'))
    renderOptions()

    expect(
      await screen.findByText("The options couldn't be loaded. Try again later.")
    ).toBeInTheDocument()
  })

  it('closes with Close or Back', async () => {
    mockGamePlayer(PLAYER)
    const onClose = vi.fn()
    renderOptions(onClose)
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: 'Close' }))
    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
