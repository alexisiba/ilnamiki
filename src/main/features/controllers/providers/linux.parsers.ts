import type { ControllerConnection, ControllerStatus } from '@shared/api'

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

/** Device object paths in the output of `busctl --json=short call … EnumerateDevices`. */
export function parseUPowerDevicePaths(output: string): string[] {
  const reply: unknown = JSON.parse(output)
  if (!isBusctlValue(reply) || !Array.isArray(reply.data) || !Array.isArray(reply.data[0])) {
    return []
  }
  return reply.data[0].filter((path): path is string => typeof path === 'string')
}

/**
 * Battery in the output of `busctl --json=short get-property … Serial Percentage`, one JSON
 * value per line in that order, or null when the device reports no usable serial.
 */
export function parseUPowerBattery(output: string): UPowerBattery | null {
  const [serial, percent] = output
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line): unknown => JSON.parse(line))
    .map((value) => (isBusctlValue(value) ? value.data : undefined))

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

function isBusctlValue(value: unknown): value is { data: unknown } {
  return typeof value === 'object' && value !== null && 'data' in value
}
