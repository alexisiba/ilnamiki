import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { mockControllerStatus, mockNetworkStatus } from '@renderer/test/api'
import { connectGamepad, type FakeGamepad } from '@renderer/test/gamepad'

import { TopBarStatus } from './TopBarStatus'

const gamepadIcon = (): HTMLElement | null =>
  screen.queryByRole('img', { name: 'Controller connected' })

const wiredIcon = (): HTMLElement | null =>
  screen.queryByRole('img', { name: 'Connected by cable' })

const batteryIcon = (): HTMLElement | null => screen.queryByRole('img', { name: /^Battery/ })

const networkIcon = (): HTMLElement | null =>
  screen.queryByRole('img', { name: /Wi-Fi|Ethernet|network/ })

/** Renders and lets the controller status request answer. */
async function renderStatus(): Promise<void> {
  render(<TopBarStatus />)
  await act(async () => {})
}

describe('TopBarStatus', () => {
  it('shows no controller icon while no gamepad is connected', () => {
    render(<TopBarStatus />)

    expect(gamepadIcon()).not.toBeInTheDocument()
  })

  it('shows the controller icon when a gamepad is already connected', () => {
    connectGamepad()
    render(<TopBarStatus />)

    expect(gamepadIcon()).toBeInTheDocument()
  })

  it('shows and hides the controller icon as a gamepad connects and disconnects', () => {
    render(<TopBarStatus />)

    let gamepad: FakeGamepad | undefined
    act(() => {
      gamepad = connectGamepad()
    })
    expect(gamepadIcon()).toBeInTheDocument()

    act(() => gamepad?.disconnect())
    expect(gamepadIcon()).not.toBeInTheDocument()
  })

  it('keeps the icon while another gamepad stays connected', () => {
    const first = connectGamepad()
    connectGamepad()
    render(<TopBarStatus />)

    act(() => first.disconnect())

    expect(gamepadIcon()).toBeInTheDocument()
  })

  describe('network', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it.each([
      ['wifi', 'Wi-Fi connected'],
      ['ethernet', 'Ethernet connected'],
      ['none', 'No network connection']
    ] as const)('shows the %s connection', async (connection, name) => {
      mockNetworkStatus({ connection })
      await renderStatus()

      expect(networkIcon()).toHaveAccessibleName(name)
    })

    it('shows the Wi-Fi signal', async () => {
      mockNetworkStatus({ connection: 'wifi', wifiSignalPercent: 64, internet: true })
      await renderStatus()

      expect(networkIcon()).toHaveAccessibleName('Wi-Fi connected, signal 64%')
    })

    it('shows Wi-Fi without signal when the signal is 0', async () => {
      mockNetworkStatus({ connection: 'wifi', wifiSignalPercent: 0, internet: true })
      await renderStatus()

      expect(networkIcon()).toHaveAccessibleName('Wi-Fi without signal')
    })

    it('shows Wi-Fi without internet whatever the signal', async () => {
      mockNetworkStatus({ connection: 'wifi', wifiSignalPercent: 90, internet: false })
      await renderStatus()

      expect(networkIcon()).toHaveAccessibleName('Wi-Fi connected, no internet')
    })

    it('shows the signal when it is not known whether the internet is reachable', async () => {
      mockNetworkStatus({ connection: 'wifi', wifiSignalPercent: 30, internet: null })
      await renderStatus()

      expect(networkIcon()).toHaveAccessibleName('Wi-Fi connected, signal 30%')
    })

    it('shows Ethernet without internet', async () => {
      mockNetworkStatus({ connection: 'ethernet', internet: false })
      await renderStatus()

      expect(networkIcon()).toHaveAccessibleName('Ethernet connected, no internet')
    })

    it('shows nothing when the system does not say how it is connected', async () => {
      mockNetworkStatus({ connection: null })
      await renderStatus()

      expect(networkIcon()).not.toBeInTheDocument()
    })

    it('shows nothing when the status request fails', async () => {
      mockNetworkStatus(new Error('No routing table'))
      await renderStatus()

      expect(networkIcon()).not.toBeInTheDocument()
    })

    it('refreshes when the browser notices the network change', async () => {
      mockNetworkStatus({ connection: 'wifi' })
      await renderStatus()

      mockNetworkStatus({ connection: 'none' })
      await act(async () => {
        window.dispatchEvent(new Event('offline'))
      })

      expect(networkIcon()).toHaveAccessibleName('No network connection')
    })

    it('refreshes the connection every 10 seconds', async () => {
      vi.useFakeTimers()
      mockNetworkStatus({ connection: 'wifi' })
      await renderStatus()

      mockNetworkStatus({ connection: 'ethernet' })
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10_000)
      })

      expect(networkIcon()).toHaveAccessibleName('Ethernet connected')
    })
  })

  describe('controller power', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('shows the cable when the controller is connected by USB', async () => {
      mockControllerStatus([{ connection: 'usb', batteryPercent: null }])
      connectGamepad()
      await renderStatus()

      expect(wiredIcon()).toBeInTheDocument()
      expect(batteryIcon()).not.toBeInTheDocument()
    })

    it('shows the battery level when the controller is connected by Bluetooth', async () => {
      mockControllerStatus([{ connection: 'bluetooth', batteryPercent: 90 }])
      connectGamepad()
      await renderStatus()

      expect(screen.getByRole('img', { name: 'Battery 90%' })).toBeInTheDocument()
      expect(wiredIcon()).not.toBeInTheDocument()
    })

    it('shows nothing when a Bluetooth controller does not report its battery', async () => {
      mockControllerStatus([{ connection: 'bluetooth', batteryPercent: null }])
      connectGamepad()
      await renderStatus()

      expect(batteryIcon()).not.toBeInTheDocument()
      expect(wiredIcon()).not.toBeInTheDocument()
    })

    it('shows nothing when the system does not say how the controller is connected', async () => {
      mockControllerStatus([{ connection: null, batteryPercent: 50 }])
      connectGamepad()
      await renderStatus()

      expect(batteryIcon()).not.toBeInTheDocument()
      expect(wiredIcon()).not.toBeInTheDocument()
    })

    it('shows nothing when the status request fails', async () => {
      mockControllerStatus(new Error('UPower is not running'))
      connectGamepad()
      await renderStatus()

      expect(batteryIcon()).not.toBeInTheDocument()
      expect(wiredIcon()).not.toBeInTheDocument()
    })

    it('shows the first controller when several are connected', async () => {
      mockControllerStatus([
        { connection: 'bluetooth', batteryPercent: 35 },
        { connection: 'usb', batteryPercent: null }
      ])
      connectGamepad()
      await renderStatus()

      expect(screen.getByRole('img', { name: 'Battery 35%' })).toBeInTheDocument()
      expect(wiredIcon()).not.toBeInTheDocument()
    })

    it('shows no power while no gamepad is connected', async () => {
      mockControllerStatus([{ connection: 'usb', batteryPercent: null }])
      await renderStatus()

      expect(wiredIcon()).not.toBeInTheDocument()
    })

    it('refreshes the battery level every minute', async () => {
      vi.useFakeTimers()
      mockControllerStatus([{ connection: 'bluetooth', batteryPercent: 90 }])
      connectGamepad()
      await renderStatus()

      mockControllerStatus([{ connection: 'bluetooth', batteryPercent: 85 }])
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60_000)
      })

      expect(screen.getByRole('img', { name: 'Battery 85%' })).toBeInTheDocument()
    })

    it('refreshes when the controller reconnects by another way', async () => {
      mockControllerStatus([{ connection: 'bluetooth', batteryPercent: 90 }])
      const gamepad = connectGamepad()
      await renderStatus()

      mockControllerStatus([{ connection: 'usb', batteryPercent: null }])
      await act(async () => {
        gamepad.disconnect()
        connectGamepad()
      })

      expect(wiredIcon()).toBeInTheDocument()
    })
  })
})
