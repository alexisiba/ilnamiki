import { describe, expect, it } from 'vitest'

import { getKeyboardAction } from './input'

describe('getKeyboardAction', () => {
  it.each([
    ['ArrowUp', 'up'],
    ['ArrowDown', 'down'],
    ['ArrowLeft', 'left'],
    ['ArrowRight', 'right'],
    ['Enter', 'confirm'],
    [' ', 'confirm'],
    ['Escape', 'back'],
    ['Backspace', 'back'],
    ['q', 'prevSection'],
    ['e', 'nextSection'],
    ['m', 'menu'],
    ['x', 'secondary'],
    ['y', 'tertiary'],
    ['PageUp', 'prevGroup'],
    ['PageDown', 'nextGroup']
  ])('maps %j to %s', (key, action) => {
    expect(getKeyboardAction(key)).toBe(action)
  })

  it('maps letters regardless of case', () => {
    expect(getKeyboardAction('Q')).toBe('prevSection')
  })

  it('returns undefined for unmapped keys', () => {
    expect(getKeyboardAction('z')).toBeUndefined()
    expect(getKeyboardAction('Shift')).toBeUndefined()
  })
})
