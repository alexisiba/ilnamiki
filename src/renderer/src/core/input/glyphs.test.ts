import { describe, expect, it } from 'vitest'

import { getButtonGlyph } from './glyphs'
import type { InputAction, InputDevice } from './input'

const ACTIONS: InputAction[] = [
  'up',
  'down',
  'left',
  'right',
  'confirm',
  'back',
  'prevSection',
  'nextSection',
  'menu',
  'secondary',
  'tertiary',
  'prevGroup',
  'nextGroup'
]
const DEVICES: InputDevice[] = ['xbox', 'playstation', 'keyboard']

describe('getButtonGlyph', () => {
  it('has a glyph for every action on every device', () => {
    for (const device of DEVICES) {
      for (const action of ACTIONS) {
        expect(getButtonGlyph(action, device), `${action} on ${device}`).toBeDefined()
      }
    }
  })

  it('uses face buttons for confirm and back on gamepads', () => {
    expect(getButtonGlyph('confirm', 'xbox')).toEqual({ shape: 'face', label: 'A' })
    expect(getButtonGlyph('back', 'playstation')).toMatchObject({ shape: 'face', label: '○' })
  })

  it('uses shoulder buttons for sections and triggers for groups', () => {
    expect(getButtonGlyph('nextSection', 'xbox')).toEqual({ shape: 'shoulder', label: 'RB' })
    expect(getButtonGlyph('prevGroup', 'playstation')).toEqual({ shape: 'shoulder', label: 'L2' })
  })

  it('uses the d-pad for directions on gamepads and keys on keyboard', () => {
    expect(getButtonGlyph('left', 'xbox')).toEqual({ shape: 'dpad', direction: 'left' })
    expect(getButtonGlyph('left', 'keyboard')).toMatchObject({ shape: 'key', label: '←' })
  })

  it('names symbol-only glyphs for assistive technology', () => {
    expect(getButtonGlyph('confirm', 'playstation')).toMatchObject({
      accessibleLabelKey: 'glyphs.cross'
    })
    expect(getButtonGlyph('up', 'keyboard')).toMatchObject({ accessibleLabelKey: 'keys.arrowUp' })
  })
})
