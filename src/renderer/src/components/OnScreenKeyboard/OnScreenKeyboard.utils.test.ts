import { describe, expect, it } from 'vitest'

import { typeKey } from './OnScreenKeyboard.utils'

describe('typeKey', () => {
  it('adds a character, in uppercase while Caps Lock is on', () => {
    expect(typeKey('meta', { kind: 'character', value: 'l' }, false)).toBe('metal')
    expect(typeKey('', { kind: 'character', value: 'ñ' }, true)).toBe('Ñ')
  })

  it('adds a space', () => {
    expect(typeKey('metal', { kind: 'space' }, false)).toBe('metal ')
  })

  it('deletes the last character, and nothing when there is none', () => {
    expect(typeKey('metal', { kind: 'backspace' }, false)).toBe('meta')
    expect(typeKey('', { kind: 'backspace' }, false)).toBe('')
  })

  it('leaves the text as it is on Caps Lock and the action key', () => {
    expect(typeKey('metal', { kind: 'capsLock' }, false)).toBe('metal')
    expect(typeKey('metal', { kind: 'action' }, false)).toBe('metal')
  })
})
