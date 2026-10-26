import type { DatabaseSync } from 'node:sqlite'

export interface PlatformSettingsRepository {
  /** The platforms the user turned off; every other platform is on. */
  listDisabled(): Set<string>
  /** Keeps whether the platform `platformId` is on, as of `now` (epoch ms). */
  setEnabled(platformId: string, enabled: boolean, now: number): void
}

/** The SQL of what the user set for each platform, over `db`. */
export function createPlatformSettingsRepository(db: DatabaseSync): PlatformSettingsRepository {
  return {
    listDisabled() {
      const rows = db
        .prepare('SELECT platform_id FROM platform_settings WHERE is_enabled = 0')
        .all() as unknown as { platform_id: string }[]
      return new Set(rows.map((row) => row.platform_id))
    },

    setEnabled(platformId, enabled, now) {
      db.prepare(
        `INSERT INTO platform_settings (platform_id, is_enabled, updated_at) VALUES (?, ?, ?)
          ON CONFLICT (platform_id) DO UPDATE SET
            is_enabled = excluded.is_enabled, updated_at = excluded.updated_at`
      ).run(platformId, enabled ? 1 : 0, now)
    }
  }
}
