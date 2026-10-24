import { renderHook } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { emitInput } from './inputBus'
import { InputScope } from './InputScope'
import { useInputAction } from './useInputAction'

describe('useInputAction', () => {
  it('reports the action of a mapped key', async () => {
    const onAction = vi.fn()
    renderHook(() => useInputAction(onAction))

    await userEvent.setup().keyboard('{ArrowDown}{PageUp}')

    expect(onAction.mock.calls).toEqual([
      ['down', 'press'],
      ['prevGroup', 'press']
    ])
  })

  it('delivers repeats of held directions, but of other buttons only when asked', () => {
    const onAction = vi.fn()
    const onRepeat = vi.fn()
    renderHook(() => useInputAction(onAction))
    renderHook(() => useInputAction(onRepeat, { repeat: true }))

    emitInput('down', 'xbox', 'repeat')
    emitInput('secondary', 'xbox', 'repeat')

    expect(onAction.mock.calls).toEqual([['down', 'repeat']])
    expect(onRepeat.mock.calls).toEqual([
      ['down', 'repeat'],
      ['secondary', 'repeat']
    ])
  })

  it('delivers releases only when asked', () => {
    const onAction = vi.fn()
    const onRelease = vi.fn()
    renderHook(() => useInputAction(onAction))
    renderHook(() => useInputAction(onRelease, { release: true }))

    emitInput('confirm', 'xbox')
    emitInput('confirm', 'xbox', 'release')

    expect(onAction.mock.calls).toEqual([['confirm', 'press']])
    expect(onRelease.mock.calls).toEqual([
      ['confirm', 'press'],
      ['confirm', 'release']
    ])
  })

  it('ignores unmapped keys', async () => {
    const onAction = vi.fn()
    renderHook(() => useInputAction(onAction))

    await userEvent.setup().keyboard('z')

    expect(onAction).not.toHaveBeenCalled()
  })

  it('sends actions only to the handlers inside an open input scope', async () => {
    const onScreenAction = vi.fn()
    const onDialogAction = vi.fn()
    renderHook(() => useInputAction(onScreenAction))
    const dialog = renderHook(() => useInputAction(onDialogAction), { wrapper: InputScope })
    const user = userEvent.setup()

    await user.keyboard('{Escape}')
    expect(onDialogAction).toHaveBeenCalledExactlyOnceWith('back', 'press')
    expect(onScreenAction).not.toHaveBeenCalled()

    dialog.unmount()
    await user.keyboard('{Escape}')
    expect(onScreenAction).toHaveBeenCalledExactlyOnceWith('back', 'press')
  })

  it('sends actions to every handler inside the open scope', async () => {
    const onField = vi.fn()
    const onKeyboard = vi.fn()
    renderHook(
      () => {
        useInputAction(onField)
        useInputAction(onKeyboard)
      },
      { wrapper: InputScope }
    )

    await userEvent.setup().keyboard('{Escape}')

    expect(onField).toHaveBeenCalledExactlyOnceWith('back', 'press')
    expect(onKeyboard).toHaveBeenCalledExactlyOnceWith('back', 'press')
  })

  it('stops listening when unmounted', async () => {
    const onAction = vi.fn()
    const { unmount } = renderHook(() => useInputAction(onAction))

    unmount()
    await userEvent.setup().keyboard('{Enter}')

    expect(onAction).not.toHaveBeenCalled()
  })
})
