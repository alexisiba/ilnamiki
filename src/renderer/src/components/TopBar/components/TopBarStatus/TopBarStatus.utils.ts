import type { BatteryLevel } from './TopBarStatus.types'

/** Level for a battery percentage: 71–100 full, 41–70 medium, 11–40 low, 0–10 warning. */
export function getBatteryLevel(percent: number): BatteryLevel {
  if (percent > 70) return 'full'
  if (percent > 40) return 'medium'
  if (percent > 10) return 'low'
  return 'warning'
}
