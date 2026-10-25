import type { Migration } from './migrate'

/**
 * A small schema history for tests, unrelated to the app's: consoles, then games that belong
 * to them, then sample rows (a seed).
 */
export const TEST_MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'Create the consoles table',
    up: `
      CREATE TABLE consoles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
      ) STRICT;
    `
  },
  {
    version: 2,
    name: 'Create the games table',
    up: `
      CREATE TABLE games (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        console_id TEXT NOT NULL REFERENCES consoles (id)
      ) STRICT;
    `
  },
  {
    version: 3,
    name: 'Seed sample consoles and games',
    up: `
      INSERT INTO consoles (id, name) VALUES ('n64', 'Nintendo 64'), ('ps1', 'PlayStation');
      INSERT INTO games (id, title, console_id) VALUES
        ('tloz-oot', 'The Legend of Zelda: Ocarina of Time', 'n64'),
        ('mgs', 'Metal Gear Solid', 'ps1');
    `
  }
]

/** A migration whose second statement fails, after a first one that would have succeeded. */
export const FAILING_MIGRATION: Migration = {
  version: 4,
  name: 'Fail halfway',
  up: `
    CREATE TABLE controllers (id TEXT PRIMARY KEY) STRICT;
    INSERT INTO missing_table (id) VALUES ('oops');
  `
}
