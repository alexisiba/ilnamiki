import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { OnScreenKeyboard } from './OnScreenKeyboard'

const keyboard = (): HTMLElement => screen.getByRole('group', { name: 'Keyboard' })

describe('OnScreenKeyboard', () => {
  it('shows the digits and QWERTY letters in order', () => {
    render(<OnScreenKeyboard actionLabel="Search" />)

    const keys = within(keyboard())
      .getAllByRole('button')
      .map((key) => key.textContent)

    expect(keys.slice(0, 20).join('')).toBe('1234567890qwertyuiop')
    expect(keys.slice(20, 39).join('')).toBe("asdfghjklñzxcvbnm-'")
  })

  it('names the special keys, including the action key from its label', () => {
    render(<OnScreenKeyboard actionLabel="Search" />)

    for (const name of ['Delete', 'Shift', 'Space', 'Search']) {
      expect(within(keyboard()).getByRole('button', { name })).toBeInTheDocument()
    }
  })
})
