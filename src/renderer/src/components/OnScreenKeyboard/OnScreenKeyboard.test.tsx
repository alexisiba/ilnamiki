import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { InputAction } from '@renderer/core/input'
import { emitInput } from '@renderer/core/input/inputBus'
import { renderWithNavigation } from '@renderer/test/renderWithNavigation'

import { OnScreenKeyboard } from './OnScreenKeyboard'

/** The keyboard typing into a text that the test can read, starting with `initialValue`. */
function TypingTest({
  initialValue = '',
  onSubmit = vi.fn()
}: {
  initialValue?: string
  onSubmit?: () => void
}): React.JSX.Element {
  const [value, setValue] = useState(initialValue)
  return (
    <>
      <output aria-label="Text">{value}</output>
      <OnScreenKeyboard
        value={value}
        onChange={setValue}
        onSubmit={onSubmit}
        actionLabel="Search"
      />
    </>
  )
}

const keyboard = (): HTMLElement => screen.getByRole('group', { name: 'Keyboard' })
const key = (name: string): HTMLElement => within(keyboard()).getByRole('button', { name })
const typed = (): string | null => screen.getByRole('status', { name: 'Text' }).textContent

/** A gamepad button pressed and held for `repeats` repeats, each one after a render. */
function holdDown(action: InputAction, repeats: number): void {
  act(() => emitInput(action, 'xbox'))
  for (let repeat = 0; repeat < repeats; repeat++) act(() => emitInput(action, 'xbox', 'repeat'))
}

describe('OnScreenKeyboard', () => {
  it('shows the digits and QWERTY letters in order', () => {
    renderWithNavigation(<TypingTest />)

    const keys = within(keyboard())
      .getAllByRole('button')
      .map((button) => button.textContent)

    expect(keys.slice(0, 20).join('')).toBe('1234567890qwertyuiop')
    expect(keys.slice(20, 39).join('')).toBe("asdfghjklñzxcvbnm-'")
  })

  it('names the special keys, including the action key from its label', () => {
    renderWithNavigation(<TypingTest />)

    for (const name of ['Delete', 'Shift', 'Space', 'Search']) {
      expect(key(name)).toBeInTheDocument()
    }
  })

  it('types the pressed keys', async () => {
    renderWithNavigation(<TypingTest />)
    const user = userEvent.setup()

    for (const name of ['m', 'g', 's', 'Space', '2']) await user.click(key(name))

    expect(typed()).toBe('mgs 2')
  })

  it('types the key focused with directions on confirm', async () => {
    renderWithNavigation(<TypingTest />)
    const user = userEvent.setup()

    await user.pointer({ target: key('k'), coords: { x: 10, y: 10 } })
    await user.keyboard('{Enter}')

    expect(typed()).toBe('k')
  })

  it('deletes the last character with the Delete key and with the secondary action', async () => {
    renderWithNavigation(<TypingTest initialValue="mgs2" />)
    const user = userEvent.setup()

    await user.click(key('Delete'))
    expect(typed()).toBe('mgs')

    await user.keyboard('x')
    expect(typed()).toBe('mg')
  })

  it('keeps deleting while the secondary action is held', () => {
    renderWithNavigation(<TypingTest initialValue="metal" />)

    holdDown('secondary', 2)

    expect(typed()).toBe('me')
  })

  it('keeps deleting while confirm is held on the Delete key', async () => {
    renderWithNavigation(<TypingTest initialValue="metal" />)

    await userEvent.setup().pointer({ target: key('Delete'), coords: { x: 10, y: 10 } })
    holdDown('confirm', 1)

    expect(typed()).toBe('met')
  })

  it('types a character key once while confirm is held on it', async () => {
    renderWithNavigation(<TypingTest />)

    await userEvent.setup().pointer({ target: key('k'), coords: { x: 10, y: 10 } })
    holdDown('confirm', 2)

    expect(typed()).toBe('k')
  })

  it('turns Shift on and off with its key and with the previous-section action', async () => {
    renderWithNavigation(<TypingTest />)
    const user = userEvent.setup()

    await user.click(key('Shift'))
    expect(key('Shift')).toHaveAttribute('aria-pressed', 'true')
    expect(key('Q')).toBeInTheDocument()

    await user.keyboard('q')
    expect(key('Shift')).toHaveAttribute('aria-pressed', 'false')
    expect(key('q')).toBeInTheDocument()
  })

  it('types uppercase letters while Shift is on', async () => {
    renderWithNavigation(<TypingTest />)
    const user = userEvent.setup()

    await user.click(key('Shift'))
    await user.click(key('Q'))

    expect(typed()).toBe('Q')
  })

  it('submits with the action key and with the menu action, without moving focus', async () => {
    const onSubmit = vi.fn()
    renderWithNavigation(<TypingTest onSubmit={onSubmit} />)
    const user = userEvent.setup()

    await user.click(key('Search'))
    await user.pointer({ target: key('k'), coords: { x: 10, y: 10 } })
    await user.keyboard('m')

    expect(onSubmit).toHaveBeenCalledTimes(2)
    expect(key('k')).toHaveFocus()
  })

  it('submits on confirm in a text field', async () => {
    const onSubmit = vi.fn()
    renderWithNavigation(
      <>
        <input aria-label="Field" />
        <TypingTest onSubmit={onSubmit} />
      </>
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('textbox', { name: 'Field' }))
    await user.keyboard('{Enter}')

    expect(onSubmit).toHaveBeenCalledOnce()
  })
})
