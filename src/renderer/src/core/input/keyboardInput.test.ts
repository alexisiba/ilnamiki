import { fireEvent } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { startKeyboardInput } from './keyboardInput'
import { REPEAT_DELAY_MS, REPEAT_INTERVAL_MS } from './repeat'

/*
 * These tests need fake timers to check the repeat timing. user-event hangs with them: after
 * each interaction Testing Library waits on a real `setTimeout(0)` and only knows how to
 * advance Jest's fake timers, not Vitest's. Keys are pressed with `fireEvent` instead.
 */
const press = (key: string, options: { repeat?: boolean } = {}): void => {
  fireEvent.keyDown(window, { key, ...options })
}
const release = (key: string): void => {
  fireEvent.keyUp(window, { key })
}

describe('startKeyboardInput', () => {
  let stop: (() => void) | undefined

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    stop?.()
    vi.useRealTimers()
  })

  function listen(): ReturnType<typeof vi.fn> {
    const emit = vi.fn()
    stop = startKeyboardInput(emit)
    return emit
  }

  it('emits the action of a mapped key as keyboard input', () => {
    const emit = listen()

    press('Enter')

    expect(emit).toHaveBeenCalledExactlyOnceWith('confirm', 'keyboard')
  })

  it('ignores unmapped keys', () => {
    const emit = listen()

    press('z')

    expect(emit).not.toHaveBeenCalled()
  })

  it('repeats a held direction after a delay, then at an interval', () => {
    const emit = listen()

    press('ArrowDown')
    vi.advanceTimersByTime(REPEAT_DELAY_MS - 1)
    expect(emit).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1)
    expect(emit).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(REPEAT_INTERVAL_MS)
    expect(emit).toHaveBeenCalledTimes(3)
    expect(emit).toHaveBeenLastCalledWith('down', 'keyboard', 'repeat')
  })

  it('stops repeating when the key is released', () => {
    const emit = listen()

    press('ArrowUp')
    release('ArrowUp')
    vi.advanceTimersByTime(REPEAT_DELAY_MS * 2)

    expect(emit).toHaveBeenCalledExactlyOnceWith('up', 'keyboard')
  })

  it('stops repeating when the window loses focus', () => {
    const emit = listen()

    press('ArrowLeft')
    fireEvent.blur(window)
    vi.advanceTimersByTime(REPEAT_DELAY_MS * 2)

    expect(emit).toHaveBeenCalledOnce()
  })

  it('ignores the system key repeat', () => {
    const emit = listen()

    press('Enter')
    press('Enter', { repeat: true })
    press('Enter', { repeat: true })

    expect(emit).toHaveBeenCalledOnce()
  })

  it('repeats held keys that are not directions too, flagged as repeats', () => {
    const emit = listen()

    press('x')
    vi.advanceTimersByTime(REPEAT_DELAY_MS)

    expect(emit.mock.calls).toEqual([
      ['secondary', 'keyboard'],
      ['secondary', 'keyboard', 'repeat']
    ])
  })

  it('reports the release of keys that are not directions, whatever their case', () => {
    const emit = listen()

    press('x')
    release('X')
    press('ArrowUp')
    release('ArrowUp')

    expect(emit.mock.calls).toEqual([
      ['secondary', 'keyboard'],
      ['secondary', 'keyboard', 'release'],
      ['up', 'keyboard']
    ])
  })

  it('releases held keys when the window loses focus', () => {
    const emit = listen()

    press('Enter')
    fireEvent.blur(window)

    expect(emit).toHaveBeenLastCalledWith('confirm', 'keyboard', 'release')
  })

  it('switches to the latest held direction', () => {
    const emit = listen()

    press('ArrowDown')
    press('ArrowRight')
    vi.advanceTimersByTime(REPEAT_DELAY_MS)

    expect(emit.mock.calls).toEqual([
      ['down', 'keyboard'],
      ['right', 'keyboard'],
      ['right', 'keyboard', 'repeat']
    ])
  })

  it('keeps repeating the latest direction when an earlier one is released', () => {
    const emit = listen()

    press('ArrowDown')
    press('ArrowRight')
    release('ArrowDown')
    vi.advanceTimersByTime(REPEAT_DELAY_MS)

    expect(emit).toHaveBeenLastCalledWith('right', 'keyboard', 'repeat')
    expect(emit).toHaveBeenCalledTimes(3)
  })

  describe('while typing in a text field', () => {
    let field: HTMLInputElement

    beforeEach(() => {
      field = document.body.appendChild(document.createElement('input'))
    })

    afterEach(() => {
      field.remove()
    })

    it('lets mapped letters, space and horizontal arrows edit instead of acting', () => {
      const emit = listen()

      for (const key of ['e', 'q', 'y', ' ', 'ArrowLeft']) {
        fireEvent.keyDown(field, { key })
      }

      expect(emit).not.toHaveBeenCalled()
    })

    it('still acts on Escape, Enter and vertical arrows', () => {
      const emit = listen()

      for (const key of ['Escape', 'Enter', 'ArrowDown']) {
        fireEvent.keyDown(field, { key })
        fireEvent.keyUp(field, { key })
      }

      expect(emit.mock.calls).toEqual([
        ['back', 'keyboard'],
        ['back', 'keyboard', 'release'],
        ['confirm', 'keyboard'],
        ['confirm', 'keyboard', 'release'],
        ['down', 'keyboard']
      ])
    })
  })

  it('stops listening when stopped', () => {
    const emit = listen()

    stop?.()
    press('Enter')

    expect(emit).not.toHaveBeenCalled()
  })
})
