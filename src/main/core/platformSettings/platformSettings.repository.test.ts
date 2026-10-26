import type { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { openDatabase } from '../database'
import { createPlatformSettingsRepository } from './platformSettings.repository'

const BSNES = { emulatorId: 'e1', coreId: 'bsnes' }

let db: DatabaseSync

beforeEach(() => {
  // The app's real migrations, on a database that lives only in memory.
  db = openDatabase(':memory:')
  db.prepare(
    `INSERT INTO emulators (id, kind, name, executable_path, created_at, updated_at)
      VALUES ('e1', 'retroarch', 'RetroArch', '/home/player/RetroArch.AppImage', 1, 1)`
  ).run()
})

afterEach(() => {
  db.close()
})

describe('platform settings repository', () => {
  it('lists nothing while the user changed no platform', () => {
    expect(createPlatformSettingsRepository(db).list()).toEqual([])
  })

  it('keeps whether a platform is on, turned off and on again', () => {
    const repository = createPlatformSettingsRepository(db)
    repository.setEnabled('nes', false, 1)
    repository.setEnabled('playstation', false, 2)
    repository.setEnabled('playstation', true, 3)

    expect(repository.list()).toEqual([
      { platformId: 'nes', isEnabled: false, defaultCore: null },
      { platformId: 'playstation', isEnabled: true, defaultCore: null }
    ])
  })

  it('keeps one row per platform, with when it last changed', () => {
    const repository = createPlatformSettingsRepository(db)
    repository.setEnabled('nes', false, 1)
    repository.setEnabled('nes', true, 5)

    expect(
      db.prepare('SELECT platform_id, is_enabled, updated_at FROM platform_settings').all()
    ).toEqual([{ platform_id: 'nes', is_enabled: 1, updated_at: 5 }])
  })

  it('keeps a platform’s default core, on, without changing whether it is on later', () => {
    const repository = createPlatformSettingsRepository(db)
    repository.setDefaultCore('super_nes', BSNES, 1)
    expect(repository.list()).toEqual([
      { platformId: 'super_nes', isEnabled: true, defaultCore: BSNES }
    ])

    repository.setEnabled('super_nes', false, 2)
    repository.setDefaultCore('super_nes', BSNES, 3)
    expect(repository.list()).toEqual([
      { platformId: 'super_nes', isEnabled: false, defaultCore: BSNES }
    ])
  })

  it('forgets a platform’s default core with null, or when its emulator is deleted', () => {
    const repository = createPlatformSettingsRepository(db)
    repository.setDefaultCore('super_nes', BSNES, 1)
    repository.setDefaultCore('super_nes', null, 2)
    expect(repository.list()[0].defaultCore).toBeNull()

    repository.setDefaultCore('super_nes', BSNES, 3)
    db.prepare("DELETE FROM emulators WHERE id = 'e1'").run()
    expect(repository.list()[0].defaultCore).toBeNull()
  })

  it('refuses an empty platform id or core, a value that isn’t on or off, or an unknown emulator', () => {
    const insert = db.prepare(
      `INSERT INTO platform_settings
          (platform_id, is_enabled, default_emulator_id, default_core, updated_at)
        VALUES (?, ?, ?, ?, 1)`
    )

    expect(() => insert.run('', 1, null, null)).toThrow(/CHECK/)
    expect(() => insert.run('nes', 2, null, null)).toThrow(/CHECK/)
    expect(() => insert.run('nes', 1, 'e1', '')).toThrow(/CHECK/)
    expect(() => insert.run('nes', 1, 'missing', 'mesen')).toThrow(/FOREIGN KEY/)
  })
})
