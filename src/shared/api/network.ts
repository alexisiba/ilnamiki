/** How the computer reaches the network: 'none' when it is offline. */
export type NetworkConnection = 'wifi' | 'ethernet' | 'none'

/** What the system reports about the computer's network connection. */
export interface NetworkStatus {
  /** How it is connected, or null when the system does not say. */
  connection: NetworkConnection | null
}

/** Information about the computer's network connection. */
export interface NetworkApi {
  /** Current status of the connection the computer uses to reach the network. */
  getStatus(): Promise<NetworkStatus>
}

export const NETWORK_CHANNELS = {
  getStatus: 'network:get-status'
} as const
