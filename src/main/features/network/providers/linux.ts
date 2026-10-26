import { access, readFile } from 'fs/promises'
import { join } from 'path'

import type { NetworkApi } from '@shared/api'

import { getProperties } from '../../../core/busctl'
import {
  parseDefaultRouteInterfaces,
  parseNetworkManagerInternet,
  toNetworkStatus,
  type LinuxInterface
} from './linux.parsers'

const IPV4_ROUTES_PATH = '/proc/net/route'
const IPV6_ROUTES_PATH = '/proc/net/ipv6_route'
const WIRELESS_PATH = '/proc/net/wireless'
const INTERFACES_PATH = '/sys/class/net'
const NETWORK_MANAGER = 'org.freedesktop.NetworkManager'

/**
 * Reads the default routes and the Wi-Fi signal from the kernel, what kind of interface each
 * route uses, and whether the internet is reachable from NetworkManager.
 */
export const linuxNetworkProvider: NetworkApi = {
  async getStatus() {
    const [ipv4Routes, ipv6Routes, wireless, internet] = await Promise.all([
      readFile(IPV4_ROUTES_PATH, 'utf8'),
      // Kernels built without IPv6 have no IPv6 routing table.
      readFile(IPV6_ROUTES_PATH, 'utf8').catch(() => ''),
      // Kernels built without wireless extensions have no wireless table.
      readFile(WIRELESS_PATH, 'utf8').catch(() => ''),
      readNetworkManagerInternet()
    ])
    const names = parseDefaultRouteInterfaces(ipv4Routes, ipv6Routes)

    return toNetworkStatus(await Promise.all(names.map(readInterface)), { wireless, internet })
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

/** Whether NetworkManager reaches the internet, or null without NetworkManager or its check. */
async function readNetworkManagerInternet(): Promise<boolean | null> {
  try {
    const output = await getProperties(
      NETWORK_MANAGER,
      '/org/freedesktop/NetworkManager',
      NETWORK_MANAGER,
      ['Connectivity', 'ConnectivityCheckEnabled']
    )
    return parseNetworkManagerInternet(output)
  } catch {
    // Systems without NetworkManager simply can't tell.
    return null
  }
}
