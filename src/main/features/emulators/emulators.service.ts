import { randomUUID } from 'crypto'
import { app } from 'electron'
import { mkdir, readFile, rm, writeFile } from 'fs/promises'
import { extname, join } from 'path'

import type {
  AddEmulatorRequest,
  AddEmulatorResult,
  ChangeEmulatorPathRequest,
  ChangeEmulatorPathResult,
  Emulator,
  InspectEmulatorResult,
  OpenEmulatorResult
} from '@shared/api'

import { getDatabase } from '../../core/database'
import { freeEmulatorTurn, startEmulator, takeEmulatorTurn } from '../../core/emulatorProcess'
import {
  createEmulatorsRepository,
  type EmulatorRecord,
  prepareOpenStart
} from '../../core/emulators'
import { selectForPlatform } from '../../core/platform'
import type { EmulatorIcon } from './emulators.types'
import { linuxEmulatorDetector } from './providers/linux'
import { unsupportedEmulatorDetector } from './providers/unsupported'

const detector = selectForPlatform({ linux: linuxEmulatorDetector }, unsupportedEmulatorDetector)

const ICON_EXTENSIONS: Record<string, string> = {
  'image/png': '.png',
  'image/svg+xml': '.svg'
}

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
}

const toDataUrl = ({ data, mimeType }: EmulatorIcon): string =>
  `data:${mimeType};base64,${data.toString('base64')}`

/** Folder of the emulators' icons, inside the app's data folder. */
const iconsFolder = (): string => join(app.getPath('userData'), 'emulators', 'icons')

/** Copies an emulator's icon into the app's data folder; its path there. */
async function saveIcon(emulatorId: string, icon: EmulatorIcon): Promise<string> {
  const folder = iconsFolder()
  await mkdir(folder, { recursive: true })
  const path = join(folder, `${emulatorId}${ICON_EXTENSIONS[icon.mimeType]}`)
  await writeFile(path, icon.data)
  return path
}

/** Deletes a stored icon; one that is already gone is fine. */
async function deleteIcon(iconPath: string | null): Promise<void> {
  if (iconPath) await rm(iconPath, { force: true })
}

/** A stored icon as a `data:` URL, or null when it is missing or unreadable. */
async function readIcon(iconPath: string | null): Promise<string | null> {
  const mimeType = iconPath && MIME_TYPES[extname(iconPath)]
  if (!iconPath || !mimeType) return null
  try {
    return toDataUrl({ data: await readFile(iconPath), mimeType })
  } catch {
    return null
  }
}

async function toEmulator(record: EmulatorRecord): Promise<Emulator> {
  return {
    id: record.id,
    kind: record.kind,
    name: record.name,
    executablePath: record.executablePath,
    version: record.version,
    iconDataUrl: await readIcon(record.iconPath),
    addedAt: record.createdAt
  }
}

/** The emulators the user adds: detected by the platform's provider, kept in the database. */
export const emulatorsService = {
  async inspect(executablePath: string): Promise<InspectEmulatorResult> {
    const result = await detector.detect(executablePath)
    if (!result.ok) return result

    const { kind, name, version, icon } = result.detected
    return { ok: true, inspection: { kind, name, version, iconDataUrl: icon && toDataUrl(icon) } }
  },

  async add({ executablePath, name }: AddEmulatorRequest): Promise<AddEmulatorResult> {
    const repository = createEmulatorsRepository(getDatabase())
    if (repository.findByExecutablePath(executablePath)) {
      return { ok: false, problem: 'already-added' }
    }

    const result = await detector.detect(executablePath)
    if (!result.ok) return result

    const { kind, version, icon, fileModifiedAt } = result.detected
    const id = randomUUID()
    const now = Date.now()
    const record: EmulatorRecord = {
      id,
      kind,
      name,
      executablePath,
      version,
      iconPath: icon && (await saveIcon(id, icon)),
      fileModifiedAt,
      createdAt: now,
      updatedAt: now
    }
    repository.insert(record)

    return { ok: true, emulator: await toEmulator(record) }
  },

  async list(): Promise<Emulator[]> {
    const records = createEmulatorsRepository(getDatabase()).list()
    return Promise.all(records.map(toEmulator))
  },

  async changePath({
    id,
    executablePath
  }: ChangeEmulatorPathRequest): Promise<ChangeEmulatorPathResult> {
    const repository = createEmulatorsRepository(getDatabase())
    const current = repository.findById(id)
    if (!current) return { ok: false, problem: 'unknown-emulator' }

    const other = repository.findByExecutablePath(executablePath)
    if (other && other.id !== id) return { ok: false, problem: 'already-added' }

    const result = await detector.detect(executablePath)
    if (!result.ok) return result

    // The user's name stays; everything detected from the application is read again.
    const { kind, version, icon, fileModifiedAt } = result.detected
    await deleteIcon(current.iconPath)
    const record: EmulatorRecord = {
      ...current,
      kind,
      executablePath,
      version,
      iconPath: icon && (await saveIcon(id, icon)),
      fileModifiedAt,
      updatedAt: Date.now()
    }
    repository.update(record)

    return { ok: true, emulator: await toEmulator(record) }
  },

  /** Forgets the emulator and its stored icon; its application is never touched. */
  async remove(id: string): Promise<void> {
    const repository = createEmulatorsRepository(getDatabase())
    const current = repository.findById(id)
    if (!current) return

    repository.delete(id)
    await deleteIcon(current.iconPath)
  },

  /**
   * Opens the emulator on its own, to be set up, or says why it can't. `onClosed` is called
   * when it closes.
   */
  async open(id: string, onClosed: () => void): Promise<OpenEmulatorResult> {
    if (!takeEmulatorTurn()) return { ok: false, problem: 'already-running' }

    let started = false
    try {
      const emulator = createEmulatorsRepository(getDatabase()).findById(id)
      if (!emulator) return { ok: false, problem: 'unknown-emulator' }

      started = await startEmulator(await prepareOpenStart(emulator), onClosed)
      return started ? { ok: true } : { ok: false, problem: 'not-started' }
    } finally {
      // Until it closes, an emulator that started keeps the others waiting.
      if (!started) freeEmulatorTurn()
    }
  }
}
