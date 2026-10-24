import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { connectGamepad, PLAYSTATION_GAMEPAD_ID } from '@renderer/test/gamepad'

import { startGamepadPolling } from './gamepadPoller'
import { REPEAT_DELAY_MS, REPEAT_INTERVAL_MS } from './repeat'

const A = 0
const X = 2
const RB = 5
const DPAD_UP = 12
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

  it('repeats a held d-pad direction after a delay, then at an interval', () => {
    const gamepad = connectGamepad()
    const emit = poll()

    gamepad.press(DPAD_DOWN)
    vi.advanceTimersToNextFrame()
    vi.advanceTimersByTime(REPEAT_DELAY_MS - 50)
    expect(emit).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(50 + 16)
    expect(emit).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(REPEAT_INTERVAL_MS)
    expect(emit).toHaveBeenCalledTimes(3)
    expect(emit).toHaveBeenLastCalledWith('down', 'xbox', 'repeat')
  })

  it('stops repeating when the direction is released', () => {
    const gamepad = connectGamepad()
    const emit = poll()

    gamepad.press(DPAD_UP)
    vi.advanceTimersToNextFrame()
    gamepad.release(DPAD_UP)
    vi.advanceTimersByTime(REPEAT_DELAY_MS * 2)

    expect(emit).toHaveBeenCalledExactlyOnceWith('up', 'xbox')
  })

  it('navigates with the left stick', () => {
    const gamepad = connectGamepad()
    const emit = poll()

    gamepad.tiltStick(0.9, 0.1)
    vi.advanceTimersToNextFrame()

    expect(emit).toHaveBeenCalledExactlyOnceWith('right', 'xbox')
  })

  it('ignores the left stick inside its dead zone', () => {
    const gamepad = connectGamepad()
    const emit = poll()

    gamepad.tiltStick(0.3, -0.2)
    vi.advanceTimersByTime(REPEAT_DELAY_MS * 2)

    expect(emit).not.toHaveBeenCalled()
  })

  it('repeats a held stick direction', () => {
    const gamepad = connectGamepad()
    const emit = poll()

    gamepad.tiltStick(0, -1)
    vi.advanceTimersToNextFrame()
    vi.advanceTimersByTime(REPEAT_DELAY_MS + 16)

    expect(emit.mock.calls).toEqual([
      ['up', 'xbox'],
      ['up', 'xbox', 'repeat']
    ])
  })

  it('ignores a direction held while unfocused until it is released', () => {
    const gamepad = connectGamepad()
    const emit = poll()
    vi.mocked(document.hasFocus).mockReturnValue(false)

    gamepad.press(DPAD_DOWN)
    vi.advanceTimersToNextFrame()
    vi.mocked(document.hasFocus).mockReturnValue(true)
    vi.advanceTimersByTime(REPEAT_DELAY_MS * 2)
    expect(emit).not.toHaveBeenCalled()

    gamepad.release(DPAD_DOWN)
    vi.advanceTimersToNextFrame()
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

    expect(emit.mock.calls).toEqual([
      ['nextSection', 'xbox'],
      ['nextSection', 'xbox', 'release'],
      ['nextSection', 'xbox']
    ])
  })

  it('repeats a held button after a delay, flagged as a repeat', () => {
    const gamepad = connectGamepad()
    const emit = poll()

    gamepad.press(X)
    vi.advanceTimersToNextFrame()
    vi.advanceTimersByTime(REPEAT_DELAY_MS + 16)

    expect(emit.mock.calls).toEqual([
      ['secondary', 'xbox'],
      ['secondary', 'xbox', 'repeat']
    ])
  })

  it('reports the release of a button and stops repeating it', () => {
    const gamepad = connectGamepad()
    const emit = poll()

    gamepad.press(X)
    vi.advanceTimersToNextFrame()
    gamepad.release(X)
    vi.advanceTimersByTime(REPEAT_DELAY_MS * 2)

    expect(emit.mock.calls).toEqual([
      ['secondary', 'xbox'],
      ['secondary', 'xbox', 'release']
    ])
  })

  it('reports a release even if focus was lost while the button was held', () => {
    const gamepad = connectGamepad()
    const emit = poll()

    gamepad.press(A)
    vi.advanceTimersToNextFrame()
    vi.mocked(document.hasFocus).mockReturnValue(false)
    gamepad.release(A)
    vi.advanceTimersToNextFrame()

    expect(emit).toHaveBeenLastCalledWith('confirm', 'xbox', 'release')
  })

  it('does not report releases of directions', () => {
    const gamepad = connectGamepad()
    const emit = poll()

    gamepad.press(DPAD_UP)
    vi.advanceTimersToNextFrame()
    gamepad.release(DPAD_UP)
    vi.advanceTimersToNextFrame()

    expect(emit).toHaveBeenCalledExactlyOnceWith('up', 'xbox')
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
