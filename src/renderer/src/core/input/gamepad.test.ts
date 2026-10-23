import { describe, expect, it } from 'vitest'

import { getGamepadButtonAction, getGamepadDevice, getNewlyPressedButtons } from './gamepad'

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
