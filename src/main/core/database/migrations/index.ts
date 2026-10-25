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
        kind TEXT NOT NULL CHECK (kind IN ('retroarch', 'unknown')),
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
  }
]
