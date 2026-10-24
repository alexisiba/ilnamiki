import { EthernetPort, GlobeOff, Wifi } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { NetworkConnection } from '@shared/api'

import { useNetworkStatus } from '@renderer/core/ipc'

import styles from '../TopBarStatus.module.css'

const NETWORK_ICONS: Record<NetworkConnection, { icon: LucideIcon; labelKey: string }> = {
  wifi: { icon: Wifi, labelKey: 'status.networkWifi' },
  ethernet: { icon: EthernetPort, labelKey: 'status.networkEthernet' },
  none: { icon: GlobeOff, labelKey: 'status.networkNone' }
}

/** How the computer is connected: Wi-Fi, Ethernet or offline. Nothing when the system doesn't say. */
export function NetworkStatusIcon(): React.JSX.Element | null {
  const { t } = useTranslation()
  const { connection } = useNetworkStatus()

  if (connection === null) return null

  const { icon: Icon, labelKey } = NETWORK_ICONS[connection]
  return <Icon className={styles.icon} role="img" aria-label={t(labelKey)} />
}
