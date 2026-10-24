import { describe, expect, it } from 'vitest'

import { parseBusctlValues } from './busctl.parsers'

describe('parseBusctlValues', () => {
  it('reads one value per line, in order', () => {
    const output = '{"type":"s","data":"3C:FA:06:05:DC:79"}\n{"type":"d","data":98}\n'

    expect(parseBusctlValues(output)).toEqual(['3C:FA:06:05:DC:79', 98])
  })

  it("reads a method's return values as one array", () => {
    const output = '{"type":"ao","data":[["/org/freedesktop/UPower/devices/battery_BAT0"]]}\n'

    expect(parseBusctlValues(output)).toEqual([[['/org/freedesktop/UPower/devices/battery_BAT0']]])
  })

  it('gives undefined for a line without a value', () => {
    expect(parseBusctlValues('{"type":"s"}\n{"type":"b","data":true}')).toEqual([undefined, true])
  })

  it('reads nothing from empty output', () => {
    expect(parseBusctlValues('')).toEqual([])
  })
})
