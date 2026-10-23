import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { connectGamepad, PLAYSTATION_GAMEPAD_ID } from '@renderer/test/gamepad'

import { startGamepadPolling } from './gamepadPoller'

const A = 0
const RB = 5
const DPAD_DOWN = 13
const VIEW = 8

describe('startGamepadPolling', () => {
  let stop: (() => void) | undefined

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })
    vi.spyOn(document, 'hasFocus').mockReturnValue(true)
  })

  afterEach(() => {
    stop?.()
    vi.useRealTimers()
  })

  function poll(): ReturnType<typeof vi.fn> {
    const emit = vi.fn()
    stop = startGamepadPolling(emit)
    return emit
  }

  it('emits the action of a pressed button with the gamepad kind', () => {
    const gamepad = connectGamepad()
    const emit = poll()

    gamepad.press(DPAD_DOWN)
    vi.advanceTimersToNextFrame()

    expect(emit).toHaveBeenCalledExactlyOnceWith('down', 'xbox')
  })

  it('reports PlayStation controllers as playstation', () => {
    const gamepad = connectGamepad(PLAYSTATION_GAMEPAD_ID)
    const emit = poll()

    gamepad.press(A)
    vi.advanceTimersToNextFrame()

    expect(emit).toHaveBeenCalledExactlyOnceWith('confirm', 'playstation')
  })

  it('emits once while a button is held, and again after releasing it', () => {
    const gamepad = connectGamepad()
    const emit = poll()

    gamepad.press(RB)
    vi.advanceTimersToNextFrame()
    vi.advanceTimersToNextFrame()
    vi.advanceTimersToNextFrame()
    expect(emit).toHaveBeenCalledTimes(1)

    gamepad.release(RB)
    vi.advanceTimersToNextFrame()
    gamepad.press(RB)
    vi.advanceTimersToNextFrame()

    expect(emit).toHaveBeenCalledTimes(2)
    expect(emit).toHaveBeenLastCalledWith('nextSection', 'xbox')
  })

  it('ignores buttons without an action', () => {
    const gamepad = connectGamepad()
    const emit = poll()

    gamepad.press(VIEW)
    vi.advanceTimersToNextFrame()

    expect(emit).not.toHaveBeenCalled()
  })

  it('ignores presses while the window has no focus, also once focus returns', () => {
    const gamepad = connectGamepad()
    const emit = poll()
    vi.mocked(document.hasFocus).mockReturnValue(false)

    gamepad.press(A)
    vi.advanceTimersToNextFrame()
    vi.mocked(document.hasFocus).mockReturnValue(true)
    vi.advanceTimersToNextFrame()

    expect(emit).not.toHaveBeenCalled()
  })

  it('reads every connected gamepad', () => {
    const xbox = connectGamepad()
    const playstation = connectGamepad(PLAYSTATION_GAMEPAD_ID)
    const emit = poll()

    xbox.press(A)
    playstation.press(RB)
    vi.advanceTimersToNextFrame()

    expect(emit.mock.calls).toEqual([
      ['confirm', 'xbox'],
      ['nextSection', 'playstation']
    ])
  })

  it('stops reading gamepads when stopped', () => {
    const gamepad = connectGamepad()
    const emit = poll()

    stop?.()
    gamepad.press(A)
    vi.advanceTimersToNextFrame()

    expect(emit).not.toHaveBeenCalled()
  })
})
