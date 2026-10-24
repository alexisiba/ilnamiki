import type { ControllerConnection, ControllerStatus } from '@shared/api'

import { parseBusctlValues } from '../../../core/busctl'

/** A controller as listed by the kernel's input subsystem. */
export interface LinuxController {
  connection: ControllerConnection | null
  /** Bluetooth address in lowercase, or null when the device has none (e.g. most USB ones). */
  address: string | null
}

/** Battery reported by UPower for one device. */
export interface UPowerBattery {
  /** Device serial in lowercase; for Bluetooth devices, their address. */
  serial: string
  percent: number
}

const CONNECTIONS: Record<string, ControllerConnection> = {
  '0003': 'usb',
  '0005': 'bluetooth'
}

/**
 * Controllers in the contents of `/proc/bus/input/devices`: the input devices with a joystick
 * handler (`jsN`), in the order the kernel lists them.
 */
export function parseInputControllers(devices: string): LinuxController[] {
  return devices
    .split(/\n\s*\n/)
    .map(parseInputDevice)
    .filter((controller) => controller !== null)
}

function parseInputDevice(block: string): LinuxController | null {
  const handlers = block.match(/^H: Handlers=(.*)$/m)?.[1] ?? ''
  if (!/\bjs\d+\b/.test(handlers)) return null

  const bus = block.match(/^I: Bus=([0-9a-f]{4})/im)?.[1].toLowerCase() ?? ''
  const address =
    block
      .match(/^U: Uniq=(.*)$/m)?.[1]
      .trim()
      .toLowerCase() ?? ''

  return {
    connection: CONNECTIONS[bus] ?? null,
    address: address === '' ? null : address
  }
}

/** Device object paths in the output of UPower's `EnumerateDevices` through busctl. */
export function parseUPowerDevicePaths(output: string): string[] {
  const [returnValues] = parseBusctlValues(output)
  if (!Array.isArray(returnValues) || !Array.isArray(returnValues[0])) return []
  return returnValues[0].filter((path): path is string => typeof path === 'string')
}

/**
 * Battery in the output of reading a UPower device's `Serial` and `Percentage` through busctl,
 * or null when the device reports no usable serial.
 */
export function parseUPowerBattery(output: string): UPowerBattery | null {
  const [serial, percent] = parseBusctlValues(output)

  if (typeof serial !== 'string' || serial === '' || typeof percent !== 'number') return null

  return {
    serial: serial.toLowerCase(),
    percent: Math.round(Math.min(Math.max(percent, 0), 100))
  }
}

/** The contract's statuses: each controller with the battery UPower reports for its address. */
export function toControllerStatuses(
  controllers: LinuxController[],
  batteries: UPowerBattery[]
): ControllerStatus[] {
  return controllers.map(({ connection, address }) => ({
    connection,
    batteryPercent: batteries.find((battery) => battery.serial === address)?.percent ?? null
  }))
}
