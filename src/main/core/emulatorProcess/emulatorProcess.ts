import { spawn } from 'child_process'
import type { BrowserWindow } from 'electron'

import type { EmulatorStart } from '../emulators'

/**
 * Whether an emulator Ilnamiki starts is starting or running, to play a game or to be set up:
 * one runs at a time, so another waits for it to close.
 */
let busy = false

/**
 * Reserves the emulator's turn, or returns false when an emulator is already starting or
 * running. Whoever reserves it frees it with `freeEmulatorTurn` if the emulator doesn't start;
 * once it starts, `startEmulator` frees it when the emulator ends.
 */
export function takeEmulatorTurn(): boolean {
  if (busy) return false
  busy = true
  return true
}

/** Frees the turn taken with `takeEmulatorTurn`, for an emulator that didn't start. */
export function freeEmulatorTurn(): void {
  busy = false
}

/**
 * Starts the emulator as `start` says, with its variables added to Ilnamiki's environment,
 * resolving whether it started. Once it has, the turn is freed and `onExit` called when it
 * ends, however it ends.
 */
export function startEmulator(
  { command, env }: EmulatorStart,
  onExit: () => void
): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(command.file, command.args, {
      stdio: 'ignore',
      env: { ...process.env, ...env }
    })
    child.once('spawn', () => {
      child.once('exit', () => {
        busy = false
        onExit()
      })
      resolve(true)
    })
    child.once('error', (error) => {
      console.error('Could not start the emulator:', error)
      resolve(false)
    })
  })
}

/** Brings `window` back in front once an emulator closes, so the user returns to Ilnamiki. */
export function bringBack(window: BrowserWindow | null): void {
  if (!window || window.isDestroyed()) return
  if (window.isMinimized()) window.restore()
  window.show()
  window.focus()
}
