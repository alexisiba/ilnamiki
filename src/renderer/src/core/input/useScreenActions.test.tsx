import { act, render, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { emitInput } from './inputBus'
import { InputScope } from './InputScope'
import type { ScreenActions } from './screenActions'
import { useActionEnabled } from './useActionEnabled'
import { useContextualActions } from './useContextualActions'
import { useInputAction } from './useInputAction'
import { useDefaultActions, useScreenActions } from './useScreenActions'

const press = (action: Parameters<typeof emitInput>[0]): void =>
  act(() => emitInput(action, 'xbox'))

function Defaults({ actions }: { actions: ScreenActions }): null {
  useDefaultActions(actions)
  return null
}

function Screen({ actions }: { actions: ScreenActions }): null {
  useScreenActions(actions)
  return null
}

describe('useScreenActions', () => {
  it('runs a contextual action’s binding on its press', () => {
    const onPress = vi.fn()
    render(<Screen actions={{ tertiary: { label: 'Sort', onPress } }} />)

    press('tertiary')

    expect(onPress).toHaveBeenCalledOnce()
  })

  it('runs the default binding on screens that keep it', () => {
    const search = vi.fn()
    render(
      <>
        <Defaults actions={{ tertiary: { label: 'Search', onPress: search } }} />
        <Screen actions={{ secondary: false }} />
      </>
    )

    press('tertiary')

    expect(search).toHaveBeenCalledOnce()
  })

  it('runs only the screen’s binding where it gives the action its own meaning', () => {
    const search = vi.fn()
    const sort = vi.fn()
    render(
      <>
        <Defaults actions={{ tertiary: { label: 'Search', onPress: search } }} />
        <Screen actions={{ tertiary: { label: 'Sort', onPress: sort } }} />
      </>
    )

    press('tertiary')

    expect(sort).toHaveBeenCalledOnce()
    expect(search).not.toHaveBeenCalled()
  })

  it('brings the default back once the screen that changed it is gone', () => {
    const search = vi.fn()
    const { rerender } = render(
      <>
        <Defaults actions={{ tertiary: { label: 'Search', onPress: search } }} />
        <Screen actions={{ tertiary: false }} />
      </>
    )

    press('tertiary')
    expect(search).not.toHaveBeenCalled()

    rerender(<Defaults actions={{ tertiary: { label: 'Search', onPress: search } }} />)
    press('tertiary')
    expect(search).toHaveBeenCalledOnce()
  })

  it('keeps a turned-off action from every handler, including fixed actions', () => {
    const onAction = vi.fn()
    renderHook(() => useInputAction(onAction))
    render(<Screen actions={{ back: false, prevSection: false }} />)

    press('back')
    press('prevSection')
    press('nextSection')

    expect(onAction.mock.calls).toEqual([['nextSection', 'press']])
  })

  it('calls the latest handler after a re-render', () => {
    const first = vi.fn()
    const latest = vi.fn()
    const { rerender } = render(<Screen actions={{ secondary: { label: 'A', onPress: first } }} />)

    rerender(<Screen actions={{ secondary: { label: 'A', onPress: latest } }} />)
    press('secondary')

    expect(latest).toHaveBeenCalledOnce()
    expect(first).not.toHaveBeenCalled()
  })

  it('applies only in its own input scope', () => {
    const onAction = vi.fn()
    function DialogHandler(): null {
      useInputAction(onAction)
      return null
    }
    render(
      <>
        <Screen actions={{ confirm: false }} />
        <InputScope>
          <DialogHandler />
        </InputScope>
      </>
    )

    press('confirm')

    expect(onAction).toHaveBeenCalledExactlyOnceWith('confirm', 'press')
  })
})

describe('useActionEnabled', () => {
  it('tells whether the current screen has an action on, as it changes', () => {
    const { result } = renderHook(() => useActionEnabled('back'))
    expect(result.current).toBe(true)

    const { unmount } = render(<Screen actions={{ back: false }} />)
    expect(result.current).toBe(false)

    unmount()
    expect(result.current).toBe(true)
  })
})

describe('useContextualActions', () => {
  it('lists the bound contextual actions with their labels, in guide order', () => {
    const onPress = (): void => {}
    render(
      <>
        <Defaults actions={{ tertiary: { label: 'Search', onPress } }} />
        <Screen actions={{ nextGroup: { label: 'Next page', onPress }, secondary: false }} />
      </>
    )

    const { result } = renderHook(() => useContextualActions())

    expect(result.current).toEqual([
      { action: 'tertiary', label: 'Search' },
      { action: 'nextGroup', label: 'Next page' }
    ])
  })

  it('updates when a label changes', () => {
    const onPress = (): void => {}
    const { rerender } = render(<Screen actions={{ secondary: { label: 'Add', onPress } }} />)
    const { result } = renderHook(() => useContextualActions())

    rerender(<Screen actions={{ secondary: { label: 'Remove', onPress } }} />)

    expect(result.current).toEqual([{ action: 'secondary', label: 'Remove' }])
  })
})
