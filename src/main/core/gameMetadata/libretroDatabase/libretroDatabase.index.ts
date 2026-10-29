import { fillMissing } from '../gameMetadata.fallback'
import type { GameDetails, IdentifiedBy } from '../gameMetadata.types'
import { readableTitle, type RdbRecord } from './libretroDatabase.parsers'

/** The games of one libretro database, ready to be looked up. */
export interface DatabaseIndex {
  /** Name of the game with each CRC. */
  byCrc: Map<string, string>
  /** Name of the game with each disc serial, e.g. "SCUS-94900", when only one game has it. */
  bySerial: Map<string, string>
  /** Name of the game whose file is named so, e.g. "kof2002.zip" (arcade games). */
  byFileName: Map<string, string>
  /** What is known about each game, by its name. */
  details: Map<string, GameDetails>
}

const textOf = (value: RdbRecord[string] | undefined): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null

const numberOf = (value: RdbRecord[string] | undefined, min: number, max: number): number | null =>
  typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
    ? value
    : null

/**
 * A record's serial as discs say it, e.g. "SCUS-94900". The databases write serials as bytes,
 * which the parser gives as hex.
 */
const recordSerial = (value: RdbRecord[string] | undefined): string | null => {
  if (typeof value !== 'string' || !/^([0-9a-f]{2})+$/.test(value)) return null
  return textOf(Buffer.from(value, 'hex').toString('latin1'))?.toUpperCase() ?? null
}

/** What one record says about its game; null for what it doesn't say. */
function detailsOf(record: RdbRecord, name: string): GameDetails {
  return {
    title: readableTitle(name),
    releaseYear: numberOf(record.releaseyear, 1950, 2100),
    releaseMonth: numberOf(record.releasemonth, 1, 12),
    developer: textOf(record.developer),
    publisher: textOf(record.publisher),
    genre: textOf(record.genre),
    players: numberOf(record.users, 1, 64)
  }
}

/**
 * The games of a database's `records`. A game may have several records with the same name
 * (one per file, or one per source the database merged): they are the same game, so its
 * details join what each says, the first record winning. A serial two games have tells
 * neither, so it is left out.
 */
export function indexRecords(records: RdbRecord[]): DatabaseIndex {
  const index: DatabaseIndex = {
    byCrc: new Map(),
    bySerial: new Map(),
    byFileName: new Map(),
    details: new Map()
  }
  const sharedSerials = new Set<string>()
  for (const record of records) {
    const name = textOf(record.name)
    if (!name) continue

    const crc = textOf(record.crc)
    if (crc && !index.byCrc.has(crc)) index.byCrc.set(crc, name)
    const serial = recordSerial(record.serial)
    if (serial && !sharedSerials.has(serial)) {
      const known = index.bySerial.get(serial)
      if (known === undefined) index.bySerial.set(serial, name)
      else if (known !== name) {
        index.bySerial.delete(serial)
        sharedSerials.add(serial)
      }
    }
    const fileName = textOf(record.rom_name)
    if (fileName && !index.byFileName.has(fileName)) index.byFileName.set(fileName, name)

    const found = detailsOf(record, name)
    const known = index.details.get(name)
    index.details.set(name, known ? fillMissing(known, found) : found)
  }
  return index
}

/** A game found in a database, and how. */
export interface FoundGame {
  database: string
  name: string
  identifiedBy: IdentifiedBy
}

/** What a game's file says about which game it is. */
export interface GameFile {
  /** CRCs its content may have. */
  crcs: string[]
  /** Its disc's serial, e.g. "SCUS-94900"; null when it doesn't say one. */
  serial: string | null
  /** Its name, e.g. "kof2002.zip". */
  fileName: string
}

/**
 * The game of `databases` (in order) a file is: first by any of its `crcs`, in every database,
 * then by its disc's `serial`, then by its exact `fileName`, as a database's file name
 * ("kof2002.zip") or as a game's name once the extension is removed ("Super Mario 64 (USA)").
 * Null when no database has it: a similar name is never taken for the game.
 */
export function findGame(
  databases: { name: string; index: DatabaseIndex }[],
  { crcs, serial, fileName }: GameFile
): FoundGame | null {
  for (const { name: database, index } of databases) {
    for (const crc of crcs) {
      const name = index.byCrc.get(crc)
      if (name) return { database, name, identifiedBy: 'crc' }
    }
  }
  if (serial) {
    for (const { name: database, index } of databases) {
      const name = index.bySerial.get(serial)
      if (name) return { database, name, identifiedBy: 'serial' }
    }
  }
  const stem = fileName.replace(/\.[^.]*$/, '')
  for (const { name: database, index } of databases) {
    const name = index.byFileName.get(fileName) ?? (index.details.has(stem) ? stem : undefined)
    if (name) return { database, name, identifiedBy: 'file-name' }
  }
  return null
}
