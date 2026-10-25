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
  }
]
