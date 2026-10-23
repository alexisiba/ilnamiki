import { describe, expect, it } from 'vitest'

import { createDirectionRepeater, REPEAT_DELAY_MS, REPEAT_INTERVAL_MS } from './repeat'

describe('createDirectionRepeater', () => {
  it('emits a new direction right away', () => {
    const repeater = createDirectionRepeater()

    expect(repeater.update('down', 0)).toBe('down')
  })

  it('waits for the delay before repeating a held direction', () => {
    const repeater = createDirectionRepeater()
    repeater.update('down', 0)

    expect(repeater.update('down', REPEAT_DELAY_MS - 1)).toBeUndefined()
    expect(repeater.update('down', REPEAT_DELAY_MS)).toBe('down')
  })

  it('repeats at the interval after the delay', () => {
    const repeater = createDirectionRepeater()
    repeater.update('right', 0)
    repeater.update('right', REPEAT_DELAY_MS)

    expect(repeater.update('right', REPEAT_DELAY_MS + REPEAT_INTERVAL_MS - 1)).toBeUndefined()
    expect(repeater.update('right', REPEAT_DELAY_MS + REPEAT_INTERVAL_MS)).toBe('right')
  })

  it('emits nothing once released', () => {
    const repeater = createDirectionRepeater()
    repeater.update('up', 0)

    expect(repeater.update(undefined, 10)).toBeUndefined()
    expect(repeater.update(undefined, REPEAT_DELAY_MS * 2)).toBeUndefined()
  })

  it('emits a changed direction right away and restarts the delay', () => {
    const repeater = createDirectionRepeater()
    repeater.update('left', 0)

    expect(repeater.update('up', 100)).toBe('up')
    expect(repeater.update('up', 100 + REPEAT_DELAY_MS - 1)).toBeUndefined()
    expect(repeater.update('up', 100 + REPEAT_DELAY_MS)).toBe('up')
  })

  it('emits the same direction right away when pressed again after a release', () => {
    const repeater = createDirectionRepeater()
    repeater.update('down', 0)
    repeater.update(undefined, 50)

    expect(repeater.update('down', 60)).toBe('down')
  })
})
