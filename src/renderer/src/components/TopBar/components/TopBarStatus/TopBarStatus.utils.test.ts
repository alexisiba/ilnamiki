import { describe, expect, it } from 'vitest'

import { getBatteryLevel, getWifiLevel } from './TopBarStatus.utils'

describe('getBatteryLevel', () => {
  it.each([
    [100, 'full'],
    [71, 'full'],
    [70, 'medium'],
    [41, 'medium'],
    [40, 'low'],
    [11, 'low'],
    [10, 'warning'],
    [0, 'warning']
  ])('maps %i%% to %s', (percent, level) => {
    expect(getBatteryLevel(percent)).toBe(level)
  })
})

describe('getWifiLevel', () => {
  it.each([
    [100, 'full'],
    [76, 'full'],
    [75, 'high'],
    [51, 'high'],
    [50, 'low'],
    [26, 'low'],
    [25, 'zero'],
    [1, 'zero']
  ])('maps %i%% to %s', (percent, level) => {
    expect(getWifiLevel(percent)).toBe(level)
  })
})
