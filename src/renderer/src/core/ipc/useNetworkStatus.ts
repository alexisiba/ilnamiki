import { useEffect, useState } from 'react'

import type { NetworkStatus } from '@shared/api'

import { getNetworkStatus } from './network'

/** Cables get unplugged and Wi-Fi drops: check often, it's only a few file reads in main. */
const REFRESH_MS = 10_000

const UNKNOWN: NetworkStatus = { connection: null }

/**
 * How the computer is connected to the network. Unknown until the system answers, and also
 * when it can't. Refreshes when the browser notices the network change and every 10 seconds.
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(UNKNOWN)

  useEffect(() => {
    let active = true

    const refresh = (): void => {
      getNetworkStatus().then(
        (next) => {
          if (active) setStatus(next)
        },
        () => {
          if (active) setStatus(UNKNOWN)
        }
      )
    }

    refresh()
    const timer = setInterval(refresh, REFRESH_MS)
    window.addEventListener('online', refresh)
    window.addEventListener('offline', refresh)

    return () => {
      active = false
      clearInterval(timer)
      window.removeEventListener('online', refresh)
      window.removeEventListener('offline', refresh)
    }
  }, [])

  return status
}
