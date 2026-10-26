import { describe, expect, it, vi } from 'vitest'

import { createProgressReporter, scanFraction } from './library.progress'

describe('scanFraction', () => {
  it('makes listing the subfolders the first half of a scan', () => {
    expect(scanFraction('listing', 0, 4)).toBe(0)
    expect(scanFraction('listing', 2, 4)).toBe(0.25)
    expect(scanFraction('listing', 4, 4)).toBe(0.5)
  })

  it('makes reading the indexes the second half', () => {
    expect(scanFraction('reading', 0, 2)).toBe(0.5)
    expect(scanFraction('reading', 1, 2)).toBe(0.75)
  })

  it('finishes a step without items at once', () => {
    expect(scanFraction('listing', 0, 0)).toBe(0.5)
    expect(scanFraction('reading', 0, 0)).toBe(1)
  })
})

describe('createProgressReporter', () => {
  it('sends the whole percent done', () => {
    const send = vi.fn()
    const report = createProgressReporter(send)

    report(0.256)

    expect(send).toHaveBeenCalledWith({ percent: 25 })
  })

  it('sends only when the percent grows, never going back', () => {
    const send = vi.fn()
    const report = createProgressReporter(send)

    report(0.1)
    report(0.104)
    report(0.05)
    report(0.2)

    expect(send.mock.calls).toEqual([[{ percent: 10 }], [{ percent: 20 }]])
  })

  it('keeps the percent between 0 and 100', () => {
    const send = vi.fn()
    const report = createProgressReporter(send)

    report(-1)
    report(2)

    expect(send.mock.calls).toEqual([[{ percent: 0 }], [{ percent: 100 }]])
  })
})
