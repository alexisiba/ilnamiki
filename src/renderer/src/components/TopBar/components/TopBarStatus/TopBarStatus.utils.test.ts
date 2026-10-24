import { describe, expect, it } from 'vitest'

import { getBatteryLevel } from './TopBarStatus.utils'

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
