import type { NetworkApi } from '@shared/api'

import { selectForPlatform } from '../../core/platform'
import { linuxNetworkProvider } from './providers/linux'
import { unsupportedNetworkProvider } from './providers/unsupported'

export const networkService: NetworkApi = selectForPlatform(
  { linux: linuxNetworkProvider },
  unsupportedNetworkProvider
)
