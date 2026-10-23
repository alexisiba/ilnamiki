import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getActiveInputDevice, subscribeToActiveInputDevice } from './activeDevice'
import { emitInput, subscribeToInput } from './inputBus'

describe('activeDevice', () => {
  const unsubscribers: (() => void)[] = []
  const watch = (listener = vi.fn()): ReturnType<typeof vi.fn> => {
    unsubscribers.push(subscribeToActiveInputDevice(listener))
    return listener
  }

  afterEach(() => {
    unsubscribers.splice(0).forEach((unsubscribe) => unsubscribe())
  })

  it('starts as the keyboard', () => {
    expect(getActiveInputDevice()).toBe('keyboard')
  })

  it('switches back to the keyboard when a mapped key is pressed', async () => {
    const listener = watch()
    emitInput('confirm', 'xbox')

    await userEvent.setup().keyboard('{ArrowDown}')

    expect(getActiveInputDevice()).toBe('keyboard')
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('switches to the gamepad kind that produced an action', () => {
    watch()

    emitInput('confirm', 'playstation')

    expect(getActiveInputDevice()).toBe('playstation')
  })

  it('notifies only when the device changes', () => {
    const listener = watch()

    emitInput('down', 'xbox')
    emitInput('confirm', 'xbox')
    emitInput('up', 'xbox')

    expect(listener).toHaveBeenCalledOnce()
  })

  it('stops following input after the last listener leaves', () => {
    const unsubscribe = subscribeToActiveInputDevice(vi.fn())
    unsubscribe()
    // Another subscriber keeps the bus running.
    unsubscribers.push(subscribeToInput(vi.fn()))

    emitInput('confirm', 'playstation')

    expect(getActiveInputDevice()).toBe('keyboard')
  })
})
