import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { GamePlayer, InstalledCore } from '@shared/api'

import { mockGamePlayer } from '@renderer/test/api'

import { GameOptions } from './GameOptions'

const BEETLE: InstalledCore = {
  id: 'mednafen_psx_hw',
  name: 'Beetle PSX HW',
  emulatorId: 'a1',
  extensions: []
}
const SWANSTATION: InstalledCore = {
  id: 'swanstation',
  name: 'SwanStation',
  emulatorId: 'a1',
  extensions: []
}

const PLAYER: GamePlayer = {
  cores: [BEETLE, SWANSTATION],
  chosenCore: null,
  playsWith: { core: { emulatorId: 'a1', coreId: 'swanstation' }, reason: 'last-session' }
}

function renderOptions(onClose = vi.fn()): void {
  render(<GameOptions gameId="g1" title="Crash Bandicoot (USA)" onClose={onClose} />)
}

const panel = (): Promise<HTMLElement> =>
  screen.findByRole('dialog', { name: 'Crash Bandicoot (USA)' })

describe('GameOptions', () => {
  it('opens a panel named by the game, reading its cores', async () => {
    mockGamePlayer(PLAYER)
    renderOptions()

    expect(await panel()).toBeInTheDocument()
    expect(screen.getByText('Options')).toBeInTheDocument()
    expect(window.api.games.getPlayer).toHaveBeenCalledWith('g1')
  })

  it('says which core the game plays with, and why', async () => {
    mockGamePlayer(PLAYER)
    renderOptions()

    expect(
      await screen.findByText('Plays with SwanStation · last played with it')
    ).toBeInTheDocument()
  })

  it('offers Automatic and each core, Automatic marked and focused while none was chosen', async () => {
    mockGamePlayer(PLAYER)
    renderOptions()

    const cores = await screen.findByRole('radiogroup', { name: 'Core' })
    const choices = within(cores).getAllByRole('radio')
    expect(choices.map((choice) => choice.textContent)).toEqual([
      "AutomaticThe core it was last played with, or the console's default",
      'Beetle PSX HW',
      'SwanStation'
    ])
    expect(choices[0]).toBeChecked()
    await waitFor(() => expect(choices[0]).toHaveFocus())
  })

  it('marks and focuses the core chosen for the game', async () => {
    mockGamePlayer({
      ...PLAYER,
      chosenCore: { emulatorId: 'a1', coreId: 'mednafen_psx_hw' },
      playsWith: { core: { emulatorId: 'a1', coreId: 'mednafen_psx_hw' }, reason: 'game' }
    })
    renderOptions()

    const beetle = await screen.findByRole('radio', { name: 'Beetle PSX HW' })
    expect(beetle).toBeChecked()
    await waitFor(() => expect(beetle).toHaveFocus())
    expect(screen.getByText('Plays with Beetle PSX HW · chosen for this game')).toBeInTheDocument()
  })

  it('keeps the core chosen for the game, then shows what it plays with', async () => {
    mockGamePlayer(PLAYER)
    renderOptions()
    const beetle = await screen.findByRole('radio', { name: 'Beetle PSX HW' })
    mockGamePlayer({
      ...PLAYER,
      chosenCore: { emulatorId: 'a1', coreId: 'mednafen_psx_hw' },
      playsWith: { core: { emulatorId: 'a1', coreId: 'mednafen_psx_hw' }, reason: 'game' }
    })

    await userEvent.setup().click(beetle)

    expect(window.api.games.setCore).toHaveBeenCalledWith('g1', {
      emulatorId: 'a1',
      coreId: 'mednafen_psx_hw'
    })
    expect(
      await screen.findByText('Plays with Beetle PSX HW · chosen for this game')
    ).toBeInTheDocument()
    expect(beetle).toBeChecked()
  })

  it('forgets the game’s core with Automatic', async () => {
    mockGamePlayer({ ...PLAYER, chosenCore: { emulatorId: 'a1', coreId: 'mednafen_psx_hw' } })
    renderOptions()

    await userEvent.setup().click(await screen.findByRole('radio', { name: /^Automatic/ }))

    expect(window.api.games.setCore).toHaveBeenCalledWith('g1', null)
  })

  it('keeps the mark where it was when the core can’t be kept, saying so', async () => {
    mockGamePlayer(PLAYER)
    vi.mocked(window.api.games.setCore).mockRejectedValue(new Error('No database'))
    renderOptions()

    await userEvent.setup().click(await screen.findByRole('radio', { name: 'Beetle PSX HW' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "The core couldn't be saved. Try again."
    )
    expect(screen.getByRole('radio', { name: /^Automatic/ })).toBeChecked()
  })

  it('names the only core, with nothing to choose, focusing Close', async () => {
    mockGamePlayer({ ...PLAYER, cores: [SWANSTATION] })
    renderOptions()

    expect(
      await screen.findByText('Plays with SwanStation · last played with it')
    ).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus())
  })

  it('says so when no installed core plays the game', async () => {
    mockGamePlayer({ cores: [], chosenCore: null, playsWith: null })
    renderOptions()

    expect(await screen.findByText('No installed core plays this console.')).toBeInTheDocument()
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
