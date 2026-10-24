import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import { parseDefaultRouteInterfaces, toNetworkStatus } from './linux.parsers'

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

describe('toNetworkStatus', () => {
  it('reports Wi-Fi when the preferred physical interface is wireless', () => {
    expect(toNetworkStatus([{ name: 'wlp0s20f3', physical: true, wireless: true }])).toEqual({
      connection: 'wifi'
    })
  })

  it('reports Ethernet when the preferred physical interface is wired', () => {
    expect(
      toNetworkStatus([
        { name: 'enp0s31f6', physical: true, wireless: false },
        { name: 'wlp0s20f3', physical: true, wireless: true }
      ])
    ).toEqual({ connection: 'ethernet' })
  })

  it('looks past virtual interfaces such as VPNs', () => {
    expect(
      toNetworkStatus([
        { name: 'tailscale0', physical: false, wireless: false },
        { name: 'wlp0s20f3', physical: true, wireless: true }
      ])
    ).toEqual({ connection: 'wifi' })
  })

  it('reports no connection without a physical interface', () => {
    expect(toNetworkStatus([])).toEqual({ connection: 'none' })
    expect(toNetworkStatus([{ name: 'tailscale0', physical: false, wireless: false }])).toEqual({
      connection: 'none'
    })
  })
})
