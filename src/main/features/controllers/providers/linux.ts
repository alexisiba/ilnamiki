import { readFile } from 'fs/promises'

import type { ControllersApi } from '@shared/api'

import { callMethod, getProperties } from '../../../core/busctl'
import {
  parseInputControllers,
  parseUPowerBattery,
  parseUPowerDevicePaths,
  toControllerStatuses,
  type UPowerBattery
} from './linux.parsers'

const INPUT_DEVICES_PATH = '/proc/bus/input/devices'
const UPOWER = 'org.freedesktop.UPower'

/** Reads controllers from the kernel's input devices and their batteries from UPower. */
export const linuxControllersProvider: ControllersApi = {
  async getStatus() {
    const controllers = parseInputControllers(await readFile(INPUT_DEVICES_PATH, 'utf8'))
    const needsBatteries = controllers.some((controller) => controller.address !== null)
    const batteries = needsBatteries ? await readUPowerBatteries() : []

    return toControllerStatuses(controllers, batteries)
  }
}

/** Every battery UPower knows about, or none when UPower can't be reached. */
async function readUPowerBatteries(): Promise<UPowerBattery[]> {
  try {
    const paths = parseUPowerDevicePaths(
      await callMethod(UPOWER, '/org/freedesktop/UPower', UPOWER, 'EnumerateDevices')
    )
    const batteries = await Promise.all(
      paths.map(async (path) =>
        parseUPowerBattery(
          await getProperties(UPOWER, path, `${UPOWER}.Device`, ['Serial', 'Percentage'])
        )
      )
    )
    return batteries.filter((battery) => battery !== null)
  } catch (error) {
    // A system without UPower simply has no battery information.
    console.warn('Could not read controller batteries from UPower:', error)
    return []
  }
}
