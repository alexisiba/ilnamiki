import type { DatabaseSync } from 'node:sqlite'

import type { EmulatorKind } from '@shared/api'

/** An emulator as it is stored. */
export interface EmulatorRecord {
  id: string
  kind: EmulatorKind
  name: string
  executablePath: string
  version: string | null
  /** The icon copied into the app's data folder, or null without one. */
  iconPath: string | null
  /** Milliseconds since the epoch, as the other timestamps. */
  fileModifiedAt: number | null
  createdAt: number
  updatedAt: number
}

interface EmulatorRow {
  id: string
  kind: EmulatorKind
  name: string
  executable_path: string
  version: string | null
  icon_path: string | null
  file_modified_at: number | null
  created_at: number
  updated_at: number
}

const COLUMNS =
  'id, kind, name, executable_path, version, icon_path, file_modified_at, created_at, updated_at'

const toRecord = (row: EmulatorRow): EmulatorRecord => ({
  id: row.id,
  kind: row.kind,
  name: row.name,
  executablePath: row.executable_path,
  version: row.version,
  iconPath: row.icon_path,
  fileModifiedAt: row.file_modified_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at
})

export interface EmulatorsRepository {
  insert(record: EmulatorRecord): void
  /** Replaces what is stored about the emulator with `record.id`. */
  update(record: EmulatorRecord): void
  /** Forgets the emulator with `id`; nothing happens when there is none. */
  delete(id: string): void
  findById(id: string): EmulatorRecord | undefined
  /** The emulator whose application is at `executablePath`, if any. */
  findByExecutablePath(executablePath: string): EmulatorRecord | undefined
  /** Every emulator, oldest first. */
  list(): EmulatorRecord[]
}

/** The SQL of the emulators the user added, over `db`. */
export function createEmulatorsRepository(db: DatabaseSync): EmulatorsRepository {
  return {
    insert(record) {
      db.prepare(`INSERT INTO emulators (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        record.id,
        record.kind,
        record.name,
        record.executablePath,
        record.version,
        record.iconPath,
        record.fileModifiedAt,
        record.createdAt,
        record.updatedAt
      )
    },

    update(record) {
      db.prepare(
        `UPDATE emulators SET kind = ?, name = ?, executable_path = ?, version = ?,
          icon_path = ?, file_modified_at = ?, updated_at = ? WHERE id = ?`
      ).run(
        record.kind,
        record.name,
        record.executablePath,
        record.version,
        record.iconPath,
        record.fileModifiedAt,
        record.updatedAt,
        record.id
      )
    },

    delete(id) {
      db.prepare('DELETE FROM emulators WHERE id = ?').run(id)
    },

    findById(id) {
      const row = db.prepare(`SELECT ${COLUMNS} FROM emulators WHERE id = ?`).get(id) as
        EmulatorRow | undefined
      return row && toRecord(row)
    },

    findByExecutablePath(executablePath) {
      const row = db
        .prepare(`SELECT ${COLUMNS} FROM emulators WHERE executable_path = ?`)
        .get(executablePath) as EmulatorRow | undefined
      return row && toRecord(row)
    },

    list() {
      const rows = db
        .prepare(`SELECT ${COLUMNS} FROM emulators ORDER BY created_at, id`)
        .all() as unknown as EmulatorRow[]
      return rows.map(toRecord)
    }
  }
}
