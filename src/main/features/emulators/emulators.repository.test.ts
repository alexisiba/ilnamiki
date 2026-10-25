import type { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { openDatabase } from '../../core/database'
import { createEmulatorsRepository, type EmulatorRecord } from './emulators.repository'

const RETROARCH: EmulatorRecord = {
  id: 'a1',
  kind: 'retroarch',
  name: 'RetroArch',
  executablePath: '/home/player/Emulators/RetroArch-Linux-x86_64.AppImage',
  version: '1.22.2',
  iconPath: '/home/player/.config/ilnamiki/emulators/icons/a1.svg',
  fileModifiedAt: 1_790_000_000_000,
  createdAt: 1_800_000_000_000,
  updatedAt: 1_800_000_000_000
}

const UNKNOWN: EmulatorRecord = {
  id: 'b2',
  kind: 'unknown',
  name: 'My emulator',
  executablePath: '/home/player/Emulators/My-Emulator.AppImage',
  version: null,
  iconPath: null,
  fileModifiedAt: null,
  createdAt: 1_800_000_000_001,
  updatedAt: 1_800_000_000_001
}

let db: DatabaseSync

beforeEach(() => {
  // The app's real migrations, on a database that lives only in memory.
  db = openDatabase(':memory:')
})

afterEach(() => {
  db.close()
})

describe('emulators repository', () => {
  it('starts with no emulators', () => {
    expect(createEmulatorsRepository(db).list()).toEqual([])
  })

  it('keeps the emulators it is given, oldest first, as they were', () => {
    const repository = createEmulatorsRepository(db)

    repository.insert(UNKNOWN)
    repository.insert(RETROARCH)

    expect(repository.list()).toEqual([RETROARCH, UNKNOWN])
  })

  it('finds an emulator by its application', () => {
    const repository = createEmulatorsRepository(db)
    repository.insert(RETROARCH)

    expect(repository.findByExecutablePath(RETROARCH.executablePath)).toEqual(RETROARCH)
    expect(repository.findByExecutablePath(UNKNOWN.executablePath)).toBeUndefined()
  })

  it('finds an emulator by its id', () => {
    const repository = createEmulatorsRepository(db)
    repository.insert(RETROARCH)

    expect(repository.findById(RETROARCH.id)).toEqual(RETROARCH)
    expect(repository.findById('missing')).toBeUndefined()
  })

  it('replaces what is stored about an emulator, keeping when it was added', () => {
    const repository = createEmulatorsRepository(db)
    repository.insert(RETROARCH)
    const moved: EmulatorRecord = {
      ...RETROARCH,
      executablePath: '/home/player/Apps/RetroArch.AppImage',
      version: '1.23.0',
      iconPath: null,
      fileModifiedAt: 1_810_000_000_000,
      updatedAt: 1_810_000_000_001,
      createdAt: 0
    }

    repository.update(moved)

    expect(repository.findById(RETROARCH.id)).toEqual({ ...moved, createdAt: RETROARCH.createdAt })
  })

  it('forgets a deleted emulator, and does nothing for one that is not there', () => {
    const repository = createEmulatorsRepository(db)
    repository.insert(RETROARCH)
    repository.insert(UNKNOWN)

    repository.delete(RETROARCH.id)
    repository.delete('missing')

    expect(repository.list()).toEqual([UNKNOWN])
  })

  it('refuses a second emulator with the same application', () => {
    const repository = createEmulatorsRepository(db)
    repository.insert(RETROARCH)

    expect(() => repository.insert({ ...RETROARCH, id: 'c3' })).toThrow(/UNIQUE/)
  })

  it('refuses kinds the app does not know and empty names', () => {
    const repository = createEmulatorsRepository(db)

    expect(() => repository.insert({ ...RETROARCH, kind: 'dolphin' as 'unknown' })).toThrow(/CHECK/)
    expect(() => repository.insert({ ...RETROARCH, name: '' })).toThrow(/CHECK/)
  })
})
