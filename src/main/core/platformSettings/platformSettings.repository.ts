import type { DatabaseSync } from 'node:sqlite'

import type { EmulatorChoice } from '@shared/api'

/** What the user set for a platform. */
export interface PlatformSettingsRecord {
  platformId: string
  isEnabled: boolean
  /** The emulator its games play with; null while the user chose none or it is gone. */
  defaultEmulator: EmulatorChoice | null
}

export interface PlatformSettingsRepository {
  /** What the user set for each platform they changed; every other platform is on, as is. */
  list(): PlatformSettingsRecord[]
  /** Keeps whether the platform `platformId` is on, as of `now` (epoch ms). */
  setEnabled(platformId: string, enabled: boolean, now: number): void
  /** Keeps the emulator the platform's games play with, or forgets it with null, as of `now`. */
  setDefaultEmulator(platformId: string, emulator: EmulatorChoice | null, now: number): void
}

interface PlatformSettingsRow {
  platform_id: string
  is_enabled: number
  default_emulator_id: string | null
  default_emulator_option: string | null
}

/** The SQL of what the user set for each platform, over `db`. */
export function createPlatformSettingsRepository(db: DatabaseSync): PlatformSettingsRepository {
  return {
    list() {
      const rows = db
        .prepare(
          `SELECT platform_id, is_enabled, default_emulator_id, default_emulator_option
            FROM platform_settings`
        )
        .all() as unknown as PlatformSettingsRow[]
      return rows.map((row) => ({
        platformId: row.platform_id,
        isEnabled: row.is_enabled === 1,
        // Its emulator deleted, the option is forgotten with it.
        defaultEmulator:
          row.default_emulator_id !== null
            ? { emulatorId: row.default_emulator_id, optionId: row.default_emulator_option }
            : null
      }))
    },

    setEnabled(platformId, enabled, now) {
      db.prepare(
        `INSERT INTO platform_settings (platform_id, is_enabled, updated_at) VALUES (?, ?, ?)
          ON CONFLICT (platform_id) DO UPDATE SET
            is_enabled = excluded.is_enabled, updated_at = excluded.updated_at`
      ).run(platformId, enabled ? 1 : 0, now)
    },

    // A platform without a row is on, so a new row keeps it on.
    setDefaultEmulator(platformId, emulator, now) {
      db.prepare(
        `INSERT INTO platform_settings
            (platform_id, is_enabled, default_emulator_id, default_emulator_option, updated_at)
          VALUES (?, 1, ?, ?, ?)
          ON CONFLICT (platform_id) DO UPDATE SET
            default_emulator_id = excluded.default_emulator_id,
            default_emulator_option = excluded.default_emulator_option,
            updated_at = excluded.updated_at`
      ).run(platformId, emulator?.emulatorId ?? null, emulator?.optionId ?? null, now)
    }
  }
}
