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

/** Link quality is reported out of 70 by every driver built on cfg80211 (all modern Wi-Fi). */
const MAX_LINK_QUALITY = 70

/**
 * Signal of `iface` from 0 to 100 in the contents of `/proc/net/wireless`, from its link
 * quality, or null when the interface isn't listed.
 */
export function parseWirelessSignal(wireless: string, iface: string): number | null {
  const line = wireless.split('\n').find((candidate) => candidate.trim().startsWith(`${iface}:`))
  // Columns after the name: status, link quality ("60."), level, noise, …
  const quality = Number.parseFloat(line?.split(':')[1]?.trim().split(/\s+/)[1] ?? '')
  if (Number.isNaN(quality)) return null

  return Math.round((Math.min(Math.max(quality, 0), MAX_LINK_QUALITY) / MAX_LINK_QUALITY) * 100)
}

/** NetworkManager's `NMConnectivityState`: 0 unknown, 1 none, 2 portal, 3 limited, 4 full. */
const CONNECTIVITY_UNKNOWN = 0
const CONNECTIVITY_FULL = 4

/**
 * Whether the internet is reachable, from the output of `busctl --json=short get-property …
 * Connectivity ConnectivityCheckEnabled` (one JSON value per line in that order), or null when
 * NetworkManager doesn't check it.
 */
export function parseNetworkManagerInternet(output: string): boolean | null {
  const [connectivity, checkEnabled] = output
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line): unknown => JSON.parse(line))
    .map((value) => (isBusctlValue(value) ? value.data : undefined))

  if (checkEnabled !== true || typeof connectivity !== 'number') return null
  if (connectivity === CONNECTIVITY_UNKNOWN) return null
  return connectivity === CONNECTIVITY_FULL
}

function isBusctlValue(value: unknown): value is { data: unknown } {
  return typeof value === 'object' && value !== null && 'data' in value
}

/** What the provider read from the system besides the routes. */
export interface NetworkReadings {
  /** Contents of `/proc/net/wireless`, empty when it couldn't be read. */
  wireless: string
  /** Whether NetworkManager reaches the internet, or null when it can't tell. */
  internet: boolean | null
}

/**
 * The contract's status from the interfaces with a default route, preferred first: the first
 * physical one decides between Wi-Fi and Ethernet, and without any the computer is offline.
 */
export function toNetworkStatus(
  interfaces: LinuxInterface[],
  { wireless, internet }: NetworkReadings
): NetworkStatus {
  const primary = interfaces.find((candidate) => candidate.physical)
  if (primary === undefined) {
    return { connection: 'none', wifiSignalPercent: null, internet: false }
  }

  if (primary.wireless) {
    return {
      connection: 'wifi',
      wifiSignalPercent: parseWirelessSignal(wireless, primary.name),
      internet
    }
  }
  return { connection: 'ethernet', wifiSignalPercent: null, internet }
}
