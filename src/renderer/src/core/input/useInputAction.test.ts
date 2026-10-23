import { renderHook } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { useInputAction } from './useInputAction'

describe('useInputAction', () => {
  it('reports the action of a mapped key', async () => {
    const onAction = vi.fn()
    renderHook(() => useInputAction(onAction))

    await userEvent.setup().keyboard('{ArrowDown}{PageUp}')

    expect(onAction).toHaveBeenNthCalledWith(1, 'down')
    expect(onAction).toHaveBeenNthCalledWith(2, 'prevGroup')
  })

  it('ignores unmapped keys', async () => {
    const onAction = vi.fn()
    renderHook(() => useInputAction(onAction))

    await userEvent.setup().keyboard('z')

    expect(onAction).not.toHaveBeenCalled()
  })

  it('stops listening when unmounted', async () => {
    const onAction = vi.fn()
    const { unmount } = renderHook(() => useInputAction(onAction))

    unmount()
    await userEvent.setup().keyboard('{Enter}')

    expect(onAction).not.toHaveBeenCalled()
  })
})
