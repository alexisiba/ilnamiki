import type { NetworkStatus } from '@shared/api'

/** How the computer is connected to the network, as reported by the system. */
export function getNetworkStatus(): Promise<NetworkStatus> {
  return window.api.network.getStatus()
}
