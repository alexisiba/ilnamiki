import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { InputAction } from '@renderer/core/input'
import { setActiveInputDevice } from '@renderer/core/input/activeDevice'
import { emitInput } from '@renderer/core/input/inputBus'
import { getPlayedSounds } from '@renderer/test/audio'
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
    expect(keys.slice(20, 38).join('')).toBe('asdfghjklñzxcvbnm-')
  })

  it('names the special keys, including the action key from its label', () => {
    renderWithNavigation(<TypingTest />)

    for (const name of ['Delete', 'Caps Lock', 'Space', 'Search']) {
      expect(key(name)).toBeInTheDocument()
    }
  })

  it('shows on each shortcut key the gamepad button that also presses it', () => {
    act(() => setActiveInputDevice('xbox'))
    renderWithNavigation(<TypingTest />)

    expect(within(key('Delete')).getByText('X')).toBeInTheDocument()
    expect(within(key('Space')).getByText('Y')).toBeInTheDocument()
    expect(within(key('Caps Lock')).getByText('LB')).toBeInTheDocument()
    expect(within(key('Search')).getByText('☰')).toBeInTheDocument()
    expect(within(key('k')).queryByText('X')).not.toBeInTheDocument()
  })

  it('hides the gamepad buttons while the keyboard is in use', () => {
    renderWithNavigation(<TypingTest />)

    expect(within(key('Space')).queryByText('Y')).not.toBeInTheDocument()
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

  it('sounds a key press for each key pressed, by pointer, confirm or shortcut', async () => {
    renderWithNavigation(<TypingTest />)
    const user = userEvent.setup()

    await user.click(key('m'))
    await user.pointer({ target: key('k'), coords: { x: 10, y: 10 } })
    await user.keyboard('{Enter}')
    holdDown('secondary', 0)
    await Promise.resolve()

    expect(getPlayedSounds()).toEqual(['key-press', 'key-press', 'key-press'])
  })

  it('deletes the last character with the Delete key and with the secondary action', async () => {
    renderWithNavigation(<TypingTest initialValue="mgs2" />)
    const user = userEvent.setup()

    await user.click(key('Delete'))
    expect(typed()).toBe('mgs')

    holdDown('secondary', 0)
    expect(typed()).toBe('mg')
  })

  it('types a space with the tertiary action, once while it is held', () => {
    renderWithNavigation(<TypingTest initialValue="mgs" />)

    holdDown('tertiary', 2)

    expect(typed()).toBe('mgs ')
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

  it('turns Caps Lock on and off with its key and with the previous-section action', async () => {
    renderWithNavigation(<TypingTest />)
    const user = userEvent.setup()

    await user.click(key('Caps Lock'))
    expect(key('Caps Lock')).toHaveAttribute('aria-pressed', 'true')
    expect(key('Q')).toBeInTheDocument()

    holdDown('prevSection', 0)
    expect(key('Caps Lock')).toHaveAttribute('aria-pressed', 'false')
    expect(key('q')).toBeInTheDocument()
  })

  it('types uppercase letters while Caps Lock is on', async () => {
    renderWithNavigation(<TypingTest />)
    const user = userEvent.setup()

    await user.click(key('Caps Lock'))
    await user.click(key('Q'))

    expect(typed()).toBe('Q')
  })

  it('submits with the action key and with the menu action, without moving focus', async () => {
    const onSubmit = vi.fn()
    renderWithNavigation(<TypingTest onSubmit={onSubmit} />)
    const user = userEvent.setup()

    await user.click(key('Search'))
    await user.pointer({ target: key('k'), coords: { x: 10, y: 10 } })
    holdDown('menu', 0)

    expect(onSubmit).toHaveBeenCalledTimes(2)
    expect(key('k')).toHaveFocus()
  })

  describe('with a physical keyboard', () => {
    const isPressed = (name: string): boolean => key(name).hasAttribute('data-pressed')

    it('shows the matching key pressed exactly while it is held', async () => {
      renderWithNavigation(<TypingTest />)
      const user = userEvent.setup()

      await user.keyboard('{a>}{ >}')
      expect(isPressed('a')).toBe(true)
      expect(isPressed('Space')).toBe(true)

      await user.keyboard('{/a}')
      expect(isPressed('a')).toBe(false)
      expect(isPressed('Space')).toBe(true)
    })

    it('releases a key pressed with Shift and let go after it', async () => {
      renderWithNavigation(<TypingTest />)
      const user = userEvent.setup()

      await user.keyboard('{Shift>}{a>}{/Shift}{/a}')

      expect(isPressed('a')).toBe(false)
    })

    it('releases every key when the window loses focus', async () => {
      renderWithNavigation(<TypingTest />)

      await userEvent.setup().keyboard('{a>}')
      act(() => window.dispatchEvent(new FocusEvent('blur')))

      expect(isPressed('a')).toBe(false)
    })

    it('types and deletes while a key is focused, without acting or clicking it', async () => {
      renderWithNavigation(<TypingTest initialValue="z" />)
      const user = userEvent.setup()

      await user.pointer({ target: key('k'), coords: { x: 10, y: 10 } })
      await user.keyboard('{Backspace}Mq x2')

      expect(typed()).toBe('Mq x2')
      expect(key('Caps Lock')).toHaveAttribute('aria-pressed', 'false')
      expect(key('k')).toHaveFocus()
      // The physical keyboard makes its own sound.
      expect(getPlayedSounds()).toEqual([])
    })

    it('leaves typing in a text field to the field', async () => {
      renderWithNavigation(
        <>
          <input aria-label="Field" />
          <TypingTest />
        </>
      )
      const user = userEvent.setup()

      await user.click(screen.getByRole('textbox', { name: 'Field' }))
      await user.keyboard('{m>}')

      expect(screen.getByRole('textbox', { name: 'Field' })).toHaveValue('m')
      expect(typed()).toBe('')
      expect(isPressed('m')).toBe(true)
    })

    it('turns Caps Lock on and off with the physical Caps Lock', async () => {
      renderWithNavigation(<TypingTest />)
      const user = userEvent.setup()

      await user.keyboard('{CapsLock}')
      expect(key('Caps Lock')).toHaveAttribute('aria-pressed', 'true')

      await user.keyboard('{CapsLock}')
      expect(key('Caps Lock')).toHaveAttribute('aria-pressed', 'false')
    })
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
