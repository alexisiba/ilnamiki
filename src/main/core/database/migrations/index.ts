import type { Migration } from '../migrate'

/**
 * The app's schema history, oldest first. Add a migration at the end for every schema change;
 * never edit or remove one that has been released.
 */
export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'Create the emulators table',
    up: `
      CREATE TABLE emulators (
        id TEXT PRIMARY KEY,
        kind TEXT NOT NULL CHECK (kind IN ('retroarch', 'eden', 'unknown')),
        name TEXT NOT NULL CHECK (length(name) > 0),
        executable_path TEXT NOT NULL UNIQUE,
        version TEXT,
        icon_path TEXT,
        extra_args TEXT,
        file_modified_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      ) STRICT;
    `
  },
  {
    version: 2,
    name: 'Create the library folders and games tables',
    up: `
      CREATE TABLE library_folders (
        id TEXT PRIMARY KEY,
        path TEXT NOT NULL UNIQUE,
        platform_id TEXT NOT NULL UNIQUE,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      ) STRICT;

      CREATE TABLE games (
        id TEXT PRIMARY KEY,
        folder_id TEXT REFERENCES library_folders (id) ON DELETE RESTRICT,
        platform_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        title TEXT NOT NULL CHECK (length(title) > 0),
        added_at INTEGER NOT NULL,
        removed_at INTEGER,
        UNIQUE (platform_id, file_path),
        CHECK ((folder_id IS NULL) = (removed_at IS NOT NULL))
      ) STRICT;

      CREATE INDEX games_folder_id_index ON games (folder_id);
    `
  },
  {
    version: 3,
    name: 'Create the play sessions table',
    up: `
      CREATE TABLE play_sessions (
        id TEXT PRIMARY KEY,
        game_id TEXT NOT NULL REFERENCES games (id) ON DELETE RESTRICT,
        emulator_id TEXT REFERENCES emulators (id) ON DELETE SET NULL,
        emulator_option TEXT CHECK (length(emulator_option) > 0),
        started_at INTEGER NOT NULL,
        ended_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        CHECK (ended_at >= started_at)
      ) STRICT;

      CREATE INDEX play_sessions_game_id_index ON play_sessions (game_id);
      CREATE INDEX play_sessions_ended_at_index ON play_sessions (ended_at);
    `
  },
  {
    version: 4,
    name: 'Create the platform settings table',
    up: `
      CREATE TABLE platform_settings (
        platform_id TEXT PRIMARY KEY CHECK (length(platform_id) > 0),
        is_enabled INTEGER NOT NULL CHECK (is_enabled IN (0, 1)),
        updated_at INTEGER NOT NULL
      ) STRICT;
    `
  },
  {
    version: 5,
    name: 'Add the emulators chosen for platforms and games',
    up: `
      ALTER TABLE platform_settings
        ADD COLUMN default_emulator_id TEXT REFERENCES emulators (id) ON DELETE SET NULL;
      ALTER TABLE platform_settings
        ADD COLUMN default_emulator_option TEXT CHECK (length(default_emulator_option) > 0);

      ALTER TABLE games
        ADD COLUMN emulator_id TEXT REFERENCES emulators (id) ON DELETE SET NULL;
      ALTER TABLE games
        ADD COLUMN emulator_option TEXT CHECK (length(emulator_option) > 0);
    `
  },
  {
    version: 6,
    name: 'Create the game metadata table',
    up: `
      CREATE TABLE game_metadata (
        game_id TEXT PRIMARY KEY REFERENCES games (id) ON DELETE CASCADE,
        identity_provider TEXT CHECK (identity_provider IN ('libretro-database')),
        identity_database TEXT CHECK (length(identity_database) > 0),
        identity_name TEXT CHECK (length(identity_name) > 0),
        identified_by TEXT CHECK (identified_by IN ('crc', 'file-name')),
        title TEXT CHECK (length(title) > 0),
        release_year INTEGER CHECK (release_year > 0),
        release_month INTEGER CHECK (release_month BETWEEN 1 AND 12),
        developer TEXT CHECK (length(developer) > 0),
        publisher TEXT CHECK (length(publisher) > 0),
        genre TEXT CHECK (length(genre) > 0),
        players INTEGER CHECK (players > 0),
        file_size INTEGER NOT NULL CHECK (file_size >= 0),
        file_modified_at INTEGER NOT NULL,
        looked_at INTEGER NOT NULL,
        CHECK (
          (identity_provider IS NULL) = (identity_database IS NULL)
          AND (identity_provider IS NULL) = (identity_name IS NULL)
          AND (identity_provider IS NULL) = (identified_by IS NULL)
        )
      ) STRICT;
    `
  },
  {
    version: 7,
    name: 'Create the game images table',
    up: `
      CREATE TABLE game_images (
        game_id TEXT NOT NULL REFERENCES games (id) ON DELETE CASCADE,
        kind TEXT NOT NULL CHECK (kind IN ('cover', 'title_screen', 'screenshot')),
        path TEXT CHECK (length(path) > 0),
        looked_at INTEGER NOT NULL,
        PRIMARY KEY (game_id, kind)
      ) STRICT;
    `
  }
]
