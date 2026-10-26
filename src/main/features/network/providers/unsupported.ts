import type { NetworkApi } from '@shared/api'

/** Platforms Ilnamiki can't read the network on yet don't say how they are connected. */
export const unsupportedNetworkProvider: NetworkApi = {
  getStatus: async () => ({ connection: null, wifiSignalPercent: null, internet: null })
}
