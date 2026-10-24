import type { ControllersApi } from '@shared/api'

import { selectForPlatform } from '../../core/platform'
import { linuxControllersProvider } from './providers/linux'
import { unsupportedControllersProvider } from './providers/unsupported'

export const controllersService: ControllersApi = selectForPlatform(
  { linux: linuxControllersProvider },
  unsupportedControllersProvider
)
