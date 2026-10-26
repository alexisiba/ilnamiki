import { describe, expect, it } from 'vitest'

import { matchPhysicalKey, typeKey } from './OnScreenKeyboard.utils'

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

describe('matchPhysicalKey', () => {
  it('matches character keys whatever their case', () => {
    expect(matchPhysicalKey('ñ')).toEqual({ kind: 'character', value: 'ñ' })
    expect(matchPhysicalKey('Q')).toEqual({ kind: 'character', value: 'q' })
  })

  it('matches Space, Backspace and Caps Lock to their keys', () => {
    expect(matchPhysicalKey(' ')).toEqual({ kind: 'space' })
    expect(matchPhysicalKey('Backspace')).toEqual({ kind: 'backspace' })
    expect(matchPhysicalKey('CapsLock')).toEqual({ kind: 'capsLock' })
  })

  it('matches nothing for keys not on screen, including Enter', () => {
    for (const key of ['Enter', 'Shift', '.', 'Tab']) expect(matchPhysicalKey(key)).toBeUndefined()
  })
})
