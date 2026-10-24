import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import {
  parseDefaultRouteInterfaces,
  parseNetworkManagerInternet,
  parseWirelessSignal,
  toNetworkStatus
} from './linux.parsers'

/** Real output captured from a Linux system. */
function fixture(name: string): string {
  return readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')
}

describe('parseDefaultRouteInterfaces', () => {
  it('finds the interface of the default route, once for IPv4 and IPv6', () => {
    expect(
      parseDefaultRouteInterfaces(fixture('route-wifi.txt'), fixture('ipv6-route-wifi.txt'))
    ).toEqual(['wlp0s20f3'])
  })

  it('ignores routes that are not default routes', () => {
    const [header, , localNetwork] = fixture('route-wifi.txt').split('\n')

    expect(parseDefaultRouteInterfaces(`${header}\n${localNetwork}`, '')).toEqual([])
  })

  it('ignores the IPv6 reject routes on loopback', () => {
    const loopbackOnly = fixture('ipv6-route-wifi.txt')
      .split('\n')
      .filter((line) => line.trim().endsWith(' lo'))
      .join('\n')

    expect(parseDefaultRouteInterfaces('', loopbackOnly)).toEqual([])
  })

  it('finds no interface when the computer has no default route', () => {
    const [header] = fixture('route-wifi.txt').split('\n')

    expect(parseDefaultRouteInterfaces(header, '')).toEqual([])
  })

  it('puts the interface with the lowest metric first', () => {
    const [header, wifi] = fixture('route-wifi.txt').split('\n')
    const ethernet = wifi.replace('wlp0s20f3', 'enp0s31f6').replace('\t600\t', '\t100\t')

    expect(parseDefaultRouteInterfaces(`${header}\n${wifi}\n${ethernet}`, '')).toEqual([
      'enp0s31f6',
      'wlp0s20f3'
    ])
  })
})

describe('parseWirelessSignal', () => {
  it("turns the interface's link quality out of 70 into a percentage", () => {
    // 63 out of 70.
    expect(parseWirelessSignal(fixture('wireless-wifi.txt'), 'wlp0s20f3')).toBe(90)
  })

  it('returns null for an interface that is not listed', () => {
    expect(parseWirelessSignal(fixture('wireless-wifi.txt'), 'wlan1')).toBeNull()
  })

  it('returns null when there is no wireless table', () => {
    expect(parseWirelessSignal('', 'wlp0s20f3')).toBeNull()
  })
})

describe('parseNetworkManagerInternet', () => {
  it('reports the internet as reachable with full connectivity', () => {
    expect(parseNetworkManagerInternet(fixture('networkmanager-connectivity-full.txt'))).toBe(true)
  })

  it.each([
    [1, 'none'],
    [2, 'a captive portal'],
    [3, 'limited connectivity']
  ])('reports the internet as unreachable with connectivity %i (%s)', (connectivity) => {
    const output = `{"type":"u","data":${connectivity}}\n{"type":"b","data":true}\n`

    expect(parseNetworkManagerInternet(output)).toBe(false)
  })

  it("can't tell when connectivity is unknown", () => {
    expect(parseNetworkManagerInternet('{"type":"u","data":0}\n{"type":"b","data":true}\n')).toBe(
      null
    )
  })

  it("can't tell when NetworkManager doesn't check connectivity", () => {
    expect(
      parseNetworkManagerInternet('{"type":"u","data":4}\n{"type":"b","data":false}\n')
    ).toBeNull()
  })
})

describe('toNetworkStatus', () => {
  const readings = { wireless: fixture('wireless-wifi.txt'), internet: true }

  it('reports Wi-Fi and its signal when the preferred physical interface is wireless', () => {
    expect(
      toNetworkStatus([{ name: 'wlp0s20f3', physical: true, wireless: true }], readings)
    ).toEqual({ connection: 'wifi', wifiSignalPercent: 90, internet: true })
  })

  it('reports Ethernet, without a signal, when the preferred physical interface is wired', () => {
    expect(
      toNetworkStatus(
        [
          { name: 'enp0s31f6', physical: true, wireless: false },
          { name: 'wlp0s20f3', physical: true, wireless: true }
        ],
        { ...readings, internet: false }
      )
    ).toEqual({ connection: 'ethernet', wifiSignalPercent: null, internet: false })
  })

  it('looks past virtual interfaces such as VPNs', () => {
    expect(
      toNetworkStatus(
        [
          { name: 'tailscale0', physical: false, wireless: false },
          { name: 'wlp0s20f3', physical: true, wireless: true }
        ],
        readings
      )
    ).toMatchObject({ connection: 'wifi' })
  })

  it('reports no connection and no internet without a physical interface', () => {
    const offline = { connection: 'none', wifiSignalPercent: null, internet: false }

    expect(toNetworkStatus([], readings)).toEqual(offline)
    expect(
      toNetworkStatus([{ name: 'tailscale0', physical: false, wireless: false }], readings)
    ).toEqual(offline)
  })
})
