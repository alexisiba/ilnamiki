import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { emitInput, subscribeToInput } from './inputBus'

describe('inputBus', () => {
  const unsubscribers: (() => void)[] = []
  const subscribe = (listener: Parameters<typeof subscribeToInput>[0]): void => {
    unsubscribers.push(subscribeToInput(listener))
  }

  afterEach(() => {
    unsubscribers.splice(0).forEach((unsubscribe) => unsubscribe())
  })

  it('reports mapped keys as keyboard actions', async () => {
    const listener = vi.fn()
    subscribe(listener)

    await userEvent.setup().keyboard('{ArrowDown}z{Enter}')

    expect(listener.mock.calls).toEqual([
      ['down', 'keyboard'],
      ['confirm', 'keyboard']
    ])
  })

  it('delivers emitted actions to every subscriber', () => {
    const first = vi.fn()
    const second = vi.fn()
    subscribe(first)
    subscribe(second)

    emitInput('nextSection', 'playstation')

    expect(first).toHaveBeenCalledWith('nextSection', 'playstation')
    expect(second).toHaveBeenCalledWith('nextSection', 'playstation')
  })

  it('listens to the keyboard once, however many subscribers there are', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener')
    subscribe(vi.fn())
    subscribe(vi.fn())

    expect(addEventListener.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(1)
  })

  it('stops listening to the keyboard after the last subscriber leaves', async () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener')
    const listener = vi.fn()
    const unsubscribe = subscribeToInput(listener)

    unsubscribe()
    await userEvent.setup().keyboard('{Enter}')

    expect(listener).not.toHaveBeenCalled()
    expect(removeEventListener.mock.calls.some(([type]) => type === 'keydown')).toBe(true)
  })

  it('keeps notifying others when a listener unsubscribes while handling an action', () => {
    const second = vi.fn()
    const unsubscribeFirst = subscribeToInput(() => unsubscribeFirst())
    subscribe(second)

    emitInput('confirm', 'xbox')

    expect(second).toHaveBeenCalledOnce()
  })
})
