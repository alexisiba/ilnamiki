import { isAbsolute } from 'path'

import type { AddEmulatorRequest, ChangeEmulatorPathRequest } from '@shared/api'

/** Longest emulator name accepted, in characters. */
export const EMULATOR_NAME_MAX_LENGTH = 100

/** Longest path accepted, in characters; far beyond any real one. */
const PATH_MAX_LENGTH = 4096

/** Emulator ids are UUIDs. */
const EMULATOR_ID_PATTERN = /^[0-9a-f-]{36}$/

/** `value` as an emulator id, or null when it can't be one. */
export function parseEmulatorId(value: unknown): string | null {
  return typeof value === 'string' && EMULATOR_ID_PATTERN.test(value) ? value : null
}

/** `value` as a request to change an emulator's application, or null when it isn't one. */
export function parseChangeEmulatorPathRequest(value: unknown): ChangeEmulatorPathRequest | null {
  if (typeof value !== 'object' || value === null) return null
  const { id, executablePath } = value as Record<string, unknown>
  const emulatorId = parseEmulatorId(id)
  const path = parseExecutablePath(executablePath)
  return emulatorId === null || path === null ? null : { id: emulatorId, executablePath: path }
}

/** `value` as an absolute path, or null when it isn't one. */
export function parseExecutablePath(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > PATH_MAX_LENGTH) return null
  return isAbsolute(value) ? value : null
}

/**
 * `value` as a request to add an emulator, with its name trimmed, or null when the renderer
 * sent something the contract doesn't allow.
 */
export function parseAddEmulatorRequest(value: unknown): AddEmulatorRequest | null {
  if (typeof value !== 'object' || value === null) return null
  const { executablePath, name } = value as Record<string, unknown>

  const path = parseExecutablePath(executablePath)
  if (path === null || typeof name !== 'string') return null

  const trimmedName = name.trim()
  if (trimmedName.length === 0 || trimmedName.length > EMULATOR_NAME_MAX_LENGTH) return null

  return { executablePath: path, name: trimmedName }
}
