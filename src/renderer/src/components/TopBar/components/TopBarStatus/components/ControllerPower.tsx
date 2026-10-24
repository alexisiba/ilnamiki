import { BatteryFull, BatteryLow, BatteryMedium, BatteryWarning, Usb } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useControllerStatus } from '@renderer/core/ipc'

import styles from '../TopBarStatus.module.css'
import type { BatteryLevel } from '../TopBarStatus.types'
import { getBatteryLevel } from '../TopBarStatus.utils'

const BATTERY_ICONS: Record<BatteryLevel, LucideIcon> = {
  full: BatteryFull,
  medium: BatteryMedium,
  low: BatteryLow,
  warning: BatteryWarning
}

/**
 * How the first controller is powered: a cable when it is plugged in by USB, or its battery
 * level over Bluetooth. Nothing when the system doesn't say.
 */
export function ControllerPower(): React.JSX.Element | null {
  const { t } = useTranslation()
  const [controller] = useControllerStatus()

  if (controller?.connection === 'usb') {
    return (
      <Usb
        className={`${styles.icon} ${styles.wiredIcon}`}
        role="img"
        aria-label={t('status.controllerWired')}
      />
    )
  }

  if (controller?.connection !== 'bluetooth' || controller.batteryPercent === null) return null

  const level = getBatteryLevel(controller.batteryPercent)
  const BatteryIcon = BATTERY_ICONS[level]
  return (
    <BatteryIcon
      className={level === 'warning' ? `${styles.icon} ${styles.warningIcon}` : styles.icon}
      role="img"
      aria-label={t('status.controllerBattery', { percent: controller.batteryPercent })}
    />
  )
}
