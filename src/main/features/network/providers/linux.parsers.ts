import type { NetworkStatus } from '@shared/api'

/** A network interface as described in `/sys/class/net`. */
export interface LinuxInterface {
  name: string
  /** Backed by hardware (it has a `device`), unlike loopback, VPNs and bridges. */
  physical: boolean
  /** A Wi-Fi interface (it has a `wireless` directory). */
  wireless: boolean
}

interface DefaultRoute {
  iface: string
  metric: number
}

const RTF_UP = 0x0001
const RTF_REJECT = 0x0200

/**
 * Interfaces with a default route in the contents of `/proc/net/route` (IPv4) and
 * `/proc/net/ipv6_route` (IPv6), the preferred one (lowest metric) first, without repeats.
 */
export function parseDefaultRouteInterfaces(ipv4Routes: string, ipv6Routes: string): string[] {
  const routes = [...parseIpv4DefaultRoutes(ipv4Routes), ...parseIpv6DefaultRoutes(ipv6Routes)]
  const ordered = routes.sort((a, b) => a.metric - b.metric).map((route) => route.iface)
  return [...new Set(ordered)]
}

/** Columns: Iface Destination Gateway Flags RefCnt Use Metric Mask …, after a header line. */
function parseIpv4DefaultRoutes(routes: string): DefaultRoute[] {
  return routes
    .split('\n')
    .slice(1)
    .map((line) => line.trim().split(/\s+/))
    .filter(([iface, destination, , flags, , , , mask]) => {
      if (iface === undefined || flags === undefined) return false
      return destination === '00000000' && mask === '00000000' && isUsable(flags)
    })
    .map(([iface, , , , , , metric]) => ({ iface, metric: Number.parseInt(metric, 10) }))
}

/** Columns: Destination PrefixLength Source SourcePrefix NextHop Metric RefCnt Use Flags Iface. */
function parseIpv6DefaultRoutes(routes: string): DefaultRoute[] {
  return routes
    .split('\n')
    .map((line) => line.trim().split(/\s+/))
    .filter(([destination, prefixLength, , , , , , , flags, iface]) => {
      if (iface === undefined || flags === undefined) return false
      return /^0{32}$/.test(destination) && prefixLength === '00' && isUsable(flags)
    })
    .map(([, , , , , metric, , , , iface]) => ({ iface, metric: Number.parseInt(metric, 16) }))
}

function isUsable(hexFlags: string): boolean {
  const flags = Number.parseInt(hexFlags, 16)
  return (flags & RTF_UP) !== 0 && (flags & RTF_REJECT) === 0
}

/**
 * The contract's status from the interfaces with a default route, preferred first: the first
 * physical one decides between Wi-Fi and Ethernet, and without any the computer is offline.
 */
export function toNetworkStatus(interfaces: LinuxInterface[]): NetworkStatus {
  const primary = interfaces.find((candidate) => candidate.physical)
  if (primary === undefined) return { connection: 'none' }
  return { connection: primary.wireless ? 'wifi' : 'ethernet' }
}
