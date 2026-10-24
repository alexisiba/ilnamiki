import { useEffect, useState } from 'react'

import type { ControllerStatus } from '@shared/api'

import { subscribeToGamepadConnection } from '@renderer/core/input'

import { getControllerStatus } from './controllers'

/** Batteries drain slowly: once a minute is enough to keep the level current. */
const REFRESH_MS = 60_000

/**
 * Status of every connected controller. Empty until the system answers, and also when it
 * can't. Refreshes when a gamepad connects or disconnects and every minute.
 */
export function useControllerStatus(): ControllerStatus[] {
  const [statuses, setStatuses] = useState<ControllerStatus[]>([])

  useEffect(() => {
    let active = true

    const refresh = (): void => {
      getControllerStatus().then(
        (next) => {
          if (active) setStatuses(next)
        },
        () => {
          if (active) setStatuses([])
        }
      )
    }

    refresh()
    const timer = setInterval(refresh, REFRESH_MS)
    const unsubscribe = subscribeToGamepadConnection(refresh)

    return () => {
      active = false
      clearInterval(timer)
      unsubscribe()
    }
  }, [])

  return statuses
}
