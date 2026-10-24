/** How a controller is connected to the computer. */
export type ControllerConnection = 'usb' | 'bluetooth'

/** What the system reports about one connected controller. */
export interface ControllerStatus {
  /** How it is connected, or null when the system does not say. */
  connection: ControllerConnection | null
  /** Remaining battery as a whole number from 0 to 100, or null when it is not reported. */
  batteryPercent: number | null
}

/** Information about the game controllers connected to the computer. */
export interface ControllersApi {
  /** Status of every connected controller, in the order the system lists them. */
  getStatus(): Promise<ControllerStatus[]>
}

export const CONTROLLERS_CHANNELS = {
  getStatus: 'controllers:get-status'
} as const
