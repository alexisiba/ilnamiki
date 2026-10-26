import type { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { openDatabase } from '../database'
import { createPlatformSettingsRepository } from './platformSettings.repository'

let db: DatabaseSync

beforeEach(() => {
  // The app's real migrations, on a database that lives only in memory.
  db = openDatabase(':memory:')
})

afterEach(() => {
  db.close()
})

describe('platform settings repository', () => {
  it('lists no platform turned off while the user turned none off', () => {
    expect(createPlatformSettingsRepository(db).listDisabled()).toEqual(new Set())
  })

  it('lists the platforms turned off, and not those turned on again', () => {
    const repository = createPlatformSettingsRepository(db)
    repository.setEnabled('nes', false, 1)
    repository.setEnabled('playstation', false, 2)
    repository.setEnabled('playstation', true, 3)

    expect(repository.listDisabled()).toEqual(new Set(['nes']))
  })

  it('keeps one row per platform, with when it last changed', () => {
    const repository = createPlatformSettingsRepository(db)
    repository.setEnabled('nes', false, 1)
    repository.setEnabled('nes', true, 5)

    expect(db.prepare('SELECT * FROM platform_settings').all()).toEqual([
      { platform_id: 'nes', is_enabled: 1, updated_at: 5 }
    ])
  })

  it('refuses an empty platform id or a value that isn’t on or off', () => {
    const insert = db.prepare(
      'INSERT INTO platform_settings (platform_id, is_enabled, updated_at) VALUES (?, ?, 1)'
    )

    expect(() => insert.run('', 1)).toThrow(/CHECK/)
    expect(() => insert.run('nes', 2)).toThrow(/CHECK/)
  })
})
