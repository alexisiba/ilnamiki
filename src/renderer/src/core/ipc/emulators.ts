import type {
  AddEmulatorRequest,
  AddEmulatorResult,
  ChangeEmulatorPathRequest,
  ChangeEmulatorPathResult,
  Emulator,
  InspectEmulatorResult,
  OpenEmulatorResult
} from '@shared/api'

import { refreshPlatforms } from './platforms'

/** The emulators shown across the app, as last read from main. */
export interface EmulatorsState {
  /** `loading` until the first answer, `failed` when the last read failed. */
  status: 'loading' | 'ready' | 'failed'
  /** Oldest first; kept from the last successful read while a new one fails. */
  emulators: Emulator[]
}

const INITIAL_STATE: EmulatorsState = { status: 'loading', emulators: [] }

let state = INITIAL_STATE
const listeners = new Set<() => void>()

function setState(next: EmulatorsState): void {
  state = next
  for (const listener of [...listeners]) listener()
}

/**
 * Asks the user to choose an emulator's application file with the system's file picker:
 * its absolute path, or null when the user cancels.
 */
export function pickEmulatorExecutable(): Promise<string | null> {
  return window.api.emulators.pickExecutable()
}

/** What can be detected about the application at `executablePath`, or why it can't be used. */
export function inspectEmulator(executablePath: string): Promise<InspectEmulatorResult> {
  return window.api.emulators.inspect(executablePath)
}

/** Reads the emulators again, telling every subscriber. */
export async function refreshEmulators(): Promise<void> {
  try {
    setState({ status: 'ready', emulators: await window.api.emulators.list() })
  } catch {
    setState({ status: 'failed', emulators: state.emulators })
  }
}

/** Reads the emulators and, as they come from them, the installed platforms again. */
async function refreshAfterChange(): Promise<void> {
  await Promise.all([refreshEmulators(), refreshPlatforms()])
}

/** Adds an emulator; once added, the emulators and platforms are read again. */
export async function addEmulator(request: AddEmulatorRequest): Promise<AddEmulatorResult> {
  const result = await window.api.emulators.add(request)
  if (result.ok) await refreshAfterChange()
  return result
}

/**
 * Points an emulator at another application; once changed, the emulators and platforms are
 * read again.
 */
export async function changeEmulatorPath(
  request: ChangeEmulatorPathRequest
): Promise<ChangeEmulatorPathResult> {
  const result = await window.api.emulators.changePath(request)
  if (result.ok) await refreshAfterChange()
  return result
}

/** Removes an emulator from Ilnamiki, then reads the emulators and platforms again. */
export async function removeEmulator(id: string): Promise<void> {
  await window.api.emulators.remove(id)
  await refreshAfterChange()
}

/**
 * Opens the emulator on its own, in full screen, so the user can set it up in its menus, or
 * says why it can't. Resolves once it has started; when it closes, the emulators and platforms
 * are read again, as setting it up may have installed or removed cores.
 */
export async function openEmulator(id: string): Promise<OpenEmulatorResult> {
  const unsubscribe = window.api.emulators.onClosed((closed) => {
    if (closed.emulatorId !== id) return
    unsubscribe()
    void refreshAfterChange()
  })
  try {
    const result = await window.api.emulators.open(id)
    if (!result.ok) unsubscribe()
    return result
  } catch (error) {
    unsubscribe()
    throw error
  }
}

/**
 * Calls `listener` whenever the emulators change. The first subscriber after none reads them
 * again, so a screen that opens shows them fresh. Returns the unsubscribe function.
 */
export function subscribeToEmulators(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) void refreshEmulators()
  return () => {
    listeners.delete(listener)
  }
}

export function getEmulatorsState(): EmulatorsState {
  return state
}

/** Forgets the emulators read, as when the app starts. For tests, between them. */
export function resetEmulators(): void {
  state = INITIAL_STATE
  listeners.clear()
}
