import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { takeBackStep } from './backNavigation'
import { useBackStep } from './useBackStep'

describe('useBackStep', () => {
  it('makes back take the step while mounted', () => {
    const onBack = vi.fn()
    const { unmount } = renderHook(() => useBackStep(onBack))

    expect(takeBackStep()).toBe(true)
    expect(onBack).toHaveBeenCalledOnce()

    unmount()
    expect(takeBackStep()).toBe(false)
  })

  it('has no step without a handler', () => {
    renderHook(() => useBackStep(undefined))

    expect(takeBackStep()).toBe(false)
  })

  it('calls the latest handler', () => {
    const first = vi.fn()
    const latest = vi.fn()
    const { rerender, unmount } = renderHook(({ onBack }) => useBackStep(onBack), {
      initialProps: { onBack: first }
    })

    rerender({ onBack: latest })
    takeBackStep()

    expect(latest).toHaveBeenCalledOnce()
    expect(first).not.toHaveBeenCalled()
    unmount()
  })

  it('stops the step when the handler goes away', () => {
    const { rerender } = renderHook(({ onBack }) => useBackStep(onBack), {
      initialProps: { onBack: vi.fn() as (() => void) | undefined }
    })

    rerender({ onBack: undefined })

    expect(takeBackStep()).toBe(false)
  })
})
