import type { ControllerStatus } from '@shared/api'

/** Status of every connected controller, as reported by the system. */
export function getControllerStatus(): Promise<ControllerStatus[]> {
  return window.api.controllers.getStatus()
}
