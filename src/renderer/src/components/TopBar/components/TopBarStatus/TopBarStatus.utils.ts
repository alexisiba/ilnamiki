import type { BatteryLevel, WifiLevel } from './TopBarStatus.types'

/** Level for a battery percentage: 71–100 full, 41–70 medium, 11–40 low, 0–10 warning. */
export function getBatteryLevel(percent: number): BatteryLevel {
  if (percent > 70) return 'full'
  if (percent > 40) return 'medium'
  if (percent > 10) return 'low'
  return 'warning'
}

/**
 * Level for a Wi-Fi signal above 0 (a signal of 0 is drawn as no Wi-Fi): 76–100 full, 51–75
 * high, 26–50 low, 1–25 zero.
 */
export function getWifiLevel(percent: number): WifiLevel {
  if (percent > 75) return 'full'
  if (percent > 50) return 'high'
  if (percent > 25) return 'low'
  return 'zero'
}
