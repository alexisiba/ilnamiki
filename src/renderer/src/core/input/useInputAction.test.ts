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

  it('sends actions only to an exclusive handler while it is mounted', async () => {
    const onScreenAction = vi.fn()
    const onDialogAction = vi.fn()
    renderHook(() => useInputAction(onScreenAction))
    const dialog = renderHook(() => useInputAction(onDialogAction, { exclusive: true }))
    const user = userEvent.setup()

    await user.keyboard('{Escape}')
    expect(onDialogAction).toHaveBeenCalledExactlyOnceWith('back')
    expect(onScreenAction).not.toHaveBeenCalled()

    dialog.unmount()
    await user.keyboard('{Escape}')
    expect(onScreenAction).toHaveBeenCalledExactlyOnceWith('back')
  })

  it('stops listening when unmounted', async () => {
    const onAction = vi.fn()
    const { unmount } = renderHook(() => useInputAction(onAction))

    unmount()
    await userEvent.setup().keyboard('{Enter}')

    expect(onAction).not.toHaveBeenCalled()
  })
})
