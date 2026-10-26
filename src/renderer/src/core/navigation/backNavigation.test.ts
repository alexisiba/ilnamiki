import { afterEach, describe, expect, it, vi } from 'vitest'

import { addBackStep, getBackTarget, takeBackStep } from './backNavigation'

describe('getBackTarget', () => {
  it('returns to the screen that opened this one, as it was left', () => {
    const state = {
      backTo: { pathname: '/library/nes', state: { backTo: { pathname: '/library' } } }
    }

    expect(getBackTarget('/games/dk-64', state)).toEqual({
      pathname: '/library/nes',
      state: { backTo: { pathname: '/library' } }
    })
  })

  it('returns to the section’s root when nothing says what opened the screen', () => {
    expect(getBackTarget('/settings/emulators/new', null)).toEqual({
      pathname: '/settings',
      state: null
    })
    expect(getBackTarget('/games/dk-64', { other: true })).toEqual({ pathname: '/', state: null })
    expect(getBackTarget('/library/nes', { backTo: { pathname: 42 } })).toEqual({
      pathname: '/library',
      state: null
    })
  })
})

describe('back steps', () => {
  const removers: (() => void)[] = []

  afterEach(() => {
    for (const remove of removers.splice(0)) remove()
  })

  it('takes nothing when no screen has a step back', () => {
    expect(takeBackStep()).toBe(false)
  })

  it('takes the newest step back', () => {
    const older = vi.fn()
    const newer = vi.fn()
    removers.push(addBackStep({ run: older }), addBackStep({ run: newer }))

    expect(takeBackStep()).toBe(true)
    expect(newer).toHaveBeenCalledOnce()
    expect(older).not.toHaveBeenCalled()
  })

  it('takes nothing once the step is removed', () => {
    const run = vi.fn()
    addBackStep({ run })()

    expect(takeBackStep()).toBe(false)
    expect(run).not.toHaveBeenCalled()
  })
})
