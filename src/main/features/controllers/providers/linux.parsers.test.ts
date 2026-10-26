import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import {
  parseInputControllers,
  parseUPowerBattery,
  parseUPowerDevicePaths,
  toControllerStatuses
} from './linux.parsers'

/** Real output captured from a Linux system. */
function fixture(name: string): string {
  return readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')
}

describe('parseInputControllers', () => {
  it('finds a controller connected by USB, without an address', () => {
    expect(parseInputControllers(fixture('input-devices-wired-controller.txt'))).toEqual([
      { connection: 'usb', address: null }
    ])
  })

  it('finds a controller connected by Bluetooth, with its address in lowercase', () => {
    expect(parseInputControllers(fixture('input-devices-bluetooth-controller.txt'))).toEqual([
      { connection: 'bluetooth', address: '3c:fa:06:05:dc:79' }
    ])
  })

  it('ignores input devices that are not controllers', () => {
    const [lidSwitch] = fixture('input-devices-wired-controller.txt').split('\n\n')

    expect(parseInputControllers(lidSwitch)).toEqual([])
  })

  it('reports an unknown connection for buses other than USB and Bluetooth', () => {
    const virtual = 'I: Bus=0006 Vendor=28de Product=11ff\nU: Uniq=\nH: Handlers=event30 js1\n'

    expect(parseInputControllers(virtual)).toEqual([{ connection: null, address: null }])
  })
})

describe('parseUPowerDevicePaths', () => {
  it('lists the device paths', () => {
    expect(parseUPowerDevicePaths(fixture('upower-devices-no-controller.txt'))).toEqual([
      '/org/freedesktop/UPower/devices/battery_BAT0',
      '/org/freedesktop/UPower/devices/line_power_AC',
      '/org/freedesktop/UPower/devices/line_power_ucsi_source_psy_USBC000o001',
      '/org/freedesktop/UPower/devices/line_power_ucsi_source_psy_USBC000o002'
    ])
  })

  it('includes the paths of connected controllers', () => {
    expect(parseUPowerDevicePaths(fixture('upower-devices-with-controller.txt'))).toContain(
      '/org/freedesktop/UPower/devices/gaming_input_dev_3C_FA_06_05_DC_79'
    )
  })

  it('returns no paths for an unexpected reply', () => {
    expect(parseUPowerDevicePaths('{"type":"s","data":"nope"}')).toEqual([])
  })
})

describe('parseUPowerBattery', () => {
  it('reads the serial and the percentage', () => {
    expect(parseUPowerBattery(fixture('upower-laptop-battery.txt'))).toEqual({
      serial: '233',
      percent: 100
    })
  })

  it("reads a controller's address as its serial, in lowercase", () => {
    expect(parseUPowerBattery(fixture('upower-controller-battery.txt'))).toEqual({
      serial: '3c:fa:06:05:dc:79',
      percent: 98
    })
  })

  it('rounds the percentage', () => {
    const output = '{"type":"s","data":"3C:FA:06:05:DC:79"}\n{"type":"d","data":89.6}\n'

    expect(parseUPowerBattery(output)).toEqual({ serial: '3c:fa:06:05:dc:79', percent: 90 })
  })

  it('returns null for a device without a serial', () => {
    const output = '{"type":"s","data":""}\n{"type":"d","data":0}\n'

    expect(parseUPowerBattery(output)).toBeNull()
  })
})

describe('toControllerStatuses', () => {
  const batteries = [
    { serial: '233', percent: 100 },
    { serial: '3c:fa:06:05:dc:79', percent: 90 }
  ]

  it('gives each controller the battery reported for its address', () => {
    expect(
      toControllerStatuses([{ connection: 'bluetooth', address: '3c:fa:06:05:dc:79' }], batteries)
    ).toEqual([{ connection: 'bluetooth', batteryPercent: 90 }])
  })

  it('reports no battery for a controller without an address or a match', () => {
    expect(
      toControllerStatuses(
        [
          { connection: 'usb', address: null },
          { connection: 'bluetooth', address: '00:11:22:33:44:55' }
        ],
        batteries
      )
    ).toEqual([
      { connection: 'usb', batteryPercent: null },
      { connection: 'bluetooth', batteryPercent: null }
    ])
  })
})
