import { access, readFile } from 'fs/promises'
import { join } from 'path'

import type { NetworkApi } from '@shared/api'

import { parseDefaultRouteInterfaces, toNetworkStatus, type LinuxInterface } from './linux.parsers'

const IPV4_ROUTES_PATH = '/proc/net/route'
const IPV6_ROUTES_PATH = '/proc/net/ipv6_route'
const INTERFACES_PATH = '/sys/class/net'

/** Reads the default routes from the kernel and what kind of interface each one uses. */
export const linuxNetworkProvider: NetworkApi = {
  async getStatus() {
    const [ipv4Routes, ipv6Routes] = await Promise.all([
      readFile(IPV4_ROUTES_PATH, 'utf8'),
      // Kernels built without IPv6 have no IPv6 routing table.
      readFile(IPV6_ROUTES_PATH, 'utf8').catch(() => '')
    ])
    const names = parseDefaultRouteInterfaces(ipv4Routes, ipv6Routes)

    return toNetworkStatus(await Promise.all(names.map(readInterface)))
  }
}

async function readInterface(name: string): Promise<LinuxInterface> {
  const [physical, wireless] = await Promise.all([
    exists(join(INTERFACES_PATH, name, 'device')),
    exists(join(INTERFACES_PATH, name, 'wireless'))
  ])
  return { name, physical, wireless }
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}
