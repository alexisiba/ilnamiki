import {
  CircleAlert,
  EthernetPort,
  GlobeOff,
  Wifi,
  WifiHigh,
  WifiLow,
  WifiOff,
  WifiZero
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useNetworkStatus } from '@renderer/core/ipc'

import styles from '../TopBarStatus.module.css'
import type { WifiLevel } from '../TopBarStatus.types'
import { getWifiLevel } from '../TopBarStatus.utils'

const WIFI_ICONS: Record<WifiLevel, LucideIcon> = {
  full: Wifi,
  high: WifiHigh,
  low: WifiLow,
  zero: WifiZero
}

/**
 * How the computer is connected: the Wi-Fi signal, Ethernet or offline, and whether the
 * internet is reachable. Nothing when the system doesn't say.
 */
export function NetworkStatusIcon(): React.JSX.Element | null {
  const { t } = useTranslation()
  const { connection, wifiSignalPercent, internet } = useNetworkStatus()

  if (connection === null) return null

  if (connection === 'none') {
    return <GlobeOff className={styles.icon} role="img" aria-label={t('status.networkNone')} />
  }

  if (connection === 'ethernet') {
    if (internet === false) {
      return (
        <span
          className={styles.group}
          role="img"
          aria-label={t('status.networkEthernetNoInternet')}
        >
          <EthernetPort className={`${styles.icon} ${styles.offIcon}`} aria-hidden />
          <CircleAlert className={`${styles.icon} ${styles.alertIcon}`} aria-hidden />
        </span>
      )
    }
    return (
      <EthernetPort className={styles.icon} role="img" aria-label={t('status.networkEthernet')} />
    )
  }

  if (internet === false) {
    return (
      <WifiOff className={styles.icon} role="img" aria-label={t('status.networkWifiNoInternet')} />
    )
  }

  if (wifiSignalPercent === null) {
    return <Wifi className={styles.icon} role="img" aria-label={t('status.networkWifi')} />
  }

  if (wifiSignalPercent === 0) {
    return (
      <WifiOff className={styles.icon} role="img" aria-label={t('status.networkWifiNoSignal')} />
    )
  }

  const WifiIcon = WIFI_ICONS[getWifiLevel(wifiSignalPercent)]
  return (
    <WifiIcon
      className={styles.icon}
      role="img"
      aria-label={t('status.networkWifiSignal', { percent: wifiSignalPercent })}
    />
  )
}
