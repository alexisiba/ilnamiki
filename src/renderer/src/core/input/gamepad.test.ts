import { describe, expect, it } from 'vitest'

import {
  getDpadDirection,
  getGamepadButtonAction,
  getGamepadDevice,
  getNewlyPressedButtons,
  getStickDirection,
  isDpadButton
} from './gamepad'

describe('getGamepadButtonAction', () => {
  it.each([
    [0, 'confirm'],
    [1, 'back'],
    [2, 'secondary'],
    [3, 'tertiary'],
    [4, 'prevSection'],
    [5, 'nextSection'],
    [6, 'prevGroup'],
    [7, 'nextGroup'],
    [9, 'menu'],
    [12, 'up'],
    [13, 'down'],
    [14, 'left'],
    [15, 'right']
  ])('maps standard button %i to %s', (index, action) => {
    expect(getGamepadButtonAction(index)).toBe(action)
  })

  it('ignores buttons without an action', () => {
    // View/Share, stick presses and the guide button.
    expect(getGamepadButtonAction(8)).toBeUndefined()
    expect(getGamepadButtonAction(10)).toBeUndefined()
    expect(getGamepadButtonAction(11)).toBeUndefined()
    expect(getGamepadButtonAction(16)).toBeUndefined()
  })
})

describe('getGamepadDevice', () => {
  it.each([
    'Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 09cc)',
    'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)',
    '054c-05c4-Sony Computer Entertainment Wireless Controller',
    'Sony Interactive Entertainment DualShock 4'
  ])('recognizes a PlayStation controller: %s', (id) => {
    expect(getGamepadDevice(id)).toBe('playstation')
  })

  it.each([
    'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)',
    'Microsoft X-Box 360 pad',
    '8BitDo Pro 2 (STANDARD GAMEPAD Vendor: 2dc8 Product: 6006)',
    'Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)'
  ])('treats any other controller as Xbox: %s', (id) => {
    expect(getGamepadDevice(id)).toBe('xbox')
  })
})

describe('d-pad', () => {
  const held = (...buttons: number[]): boolean[] =>
    Array.from({ length: 17 }, (_, index) => buttons.includes(index))

  it('recognizes the d-pad buttons', () => {
    expect([12, 13, 14, 15].every(isDpadButton)).toBe(true)
    expect(isDpadButton(0)).toBe(false)
  })

  it('returns the held d-pad direction', () => {
    expect(getDpadDirection(held(13))).toBe('down')
    expect(getDpadDirection(held(15))).toBe('right')
  })

  it('returns undefined when no d-pad button is held', () => {
    expect(getDpadDirection(held(0))).toBeUndefined()
  })

  it('picks one direction when several are held', () => {
    expect(getDpadDirection(held(12, 15))).toBe('up')
  })
})

describe('getStickDirection', () => {
  it.each([
    [0.8, 0, 'right'],
    [-0.8, 0, 'left'],
    [0, 0.8, 'down'],
    [0, -0.8, 'up']
  ] as const)('points (%d, %d) to %s', (x, y, direction) => {
    expect(getStickDirection(x, y)).toBe(direction)
  })

  it('ignores small tilts inside the dead zone', () => {
    expect(getStickDirection(0.4, 0.2)).toBeUndefined()
  })

  it('uses only the dominant axis, without diagonals', () => {
    expect(getStickDirection(0.7, 0.6)).toBe('right')
    expect(getStickDirection(-0.55, 0.9)).toBe('down')
  })

  it('keeps the current direction until the stick comes back past the release point', () => {
    expect(getStickDirection(0.4, 0, 'right')).toBe('right')
    expect(getStickDirection(0.3, 0, 'right')).toBeUndefined()
  })

  it('does not keep the current direction when the stick points the other way', () => {
    expect(getStickDirection(-0.4, 0, 'right')).toBeUndefined()
  })

  it('switches to a new direction tilted past the press point', () => {
    expect(getStickDirection(0.4, 0.6, 'right')).toBe('down')
  })
})

describe('getNewlyPressedButtons', () => {
  it('returns buttons that just went down', () => {
    expect(getNewlyPressedButtons([false, false, false], [true, false, true])).toEqual([0, 2])
  })

  it('ignores buttons that are still held or were released', () => {
    expect(getNewlyPressedButtons([true, true], [true, false])).toEqual([])
  })

  it('treats buttons missing from the previous state as released', () => {
    expect(getNewlyPressedButtons([], [false, true])).toEqual([1])
  })
})
