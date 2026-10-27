---
name: main-database
description: How Ilnamiki stores data in its SQLite database (node:sqlite, in the main process only) — what kinds of data belong in the database and what is kept another way (read live from disk, shipped in code, stored as files), where the database code lives, versioned migrations that are never edited once released, schema conventions (STRICT tables, snake_case, TEXT UUID ids, epoch-ms timestamps, explicit foreign keys), safe queries with prepared statements, transactions, keeping DATABASE.md in sync, and testing against in-memory databases. Use whenever deciding whether something should be persisted, adding or changing a table, column, index or migration, writing SQL or a repository in main, or touching src/main/core/database or DATABASE.md.
---

# Main Database

Ilnamiki keeps its data in one SQLite database, opened by the main process with the
`node:sqlite` module built into Electron (no dependency). This skill decides what goes in it
and how it is written.

Related skills: `main-renderer-api` (how data reaches the renderer), `utils-placement`
(pure helpers), `react-testing` (renderer tests mock `window.api`, never the database).

Source of truth for the current schema: the migrations in
`src/main/core/database/migrations/`. **`DATABASE.md`** (repo root) explains it: tables,
fields, meanings and relations.

## 1. What goes in the database, and what doesn't

The rule: **the database keeps what the user decides and what can't be worked out again.**
Anything that can be read again from the system, ships with the app, or is binary content is
kept another way.

### Goes in the database

- **User decisions and configuration:** what the user set up or chose (emulators they added,
  which emulator each platform plays with, folders they want scanned, per-item overrides,
  app preferences).
- **History that can't be rebuilt:** things that happened (play sessions, when something was
  added or last used). Once lost, they are gone.
- **Results of slow work, kept as a cache:** information that takes time or processes to get
  and is needed often (what a scan of the library found, what was detected about an emulator
  file). Store what is needed to tell when it is stale (e.g. the file's modification time)
  and refresh it then.
- **Anything that has to be searched, sorted, filtered or related** to other data (a library
  of thousands of games, statistics over sessions).

### Kept another way

- **Live system state, read when needed:** what is on disk or in the system right now and
  changes outside Ilnamiki (the options an emulator has, whether a file exists, connected
  hardware). Copying it into the database only creates a second version that goes out of
  date.
- **Static catalogs that ship with the app, in code:** reference data Ilnamiki defines and
  updates with each release (the list of platforms and their details, the known emulators and
  how to recognize and launch them). In the database they would need a migration for every
  correction. The database stores only their stable ids (e.g. `nintendo_64`).
- **Binary content, as files:** images, icons, artwork, anything large. They live in the
  app's data folder; the database stores their path.
- **Derived values, computed by queries:** totals, counts and "last time" values that follow
  from stored rows (total playtime is the sum of the sessions). Cache one in a column only
  when a measured need appears, and update it in the same transaction as its source.
- **Secrets:** nothing sensitive is stored in plain text. Credentials, if ever needed, go to
  the system keychain (Electron `safeStorage`), not to a table.
- **Renderer-only state:** what a screen shows or remembers while the app runs (focus,
  selection, scroll) stays in the renderer.

When unsure, ask: *can this be read again, and does it change outside Ilnamiki?* If yes, read
it live. *Did the user decide it or did it happen?* If yes, store it.

## 2. Where it lives

```
src/main/core/database/
  database.ts        ← openDatabase(): options, journal mode, migrations
  migrate.ts         ← migrate(), the Migration type, schema version
  migrations/        ← MIGRATIONS: the app's schema history, oldest first
  transaction.ts     ← transaction(): commit on return, roll back on throw
  connection.ts      ← the app's connection: initDatabase, getDatabase, closeDatabase
src/main/features/<domain>/
  <domain>.repository.ts   ← the domain's SQL: reads rows, returns contract data
src/main/core/<domain>/
  <domain>.repository.ts   ← a domain's SQL that more than one feature uses
```

- Only main touches the database. The renderer gets data through the domain's API
  (`main-renderer-api`) and never sees SQL, rows or table names.
- Each domain keeps its SQL in its own `<domain>.repository.ts`, which uses `getDatabase()`
  and converts between rows and the contract's types. Services and IPC handlers call the
  repository; nothing else writes SQL.
- **A repository lives as close as possible to the code that uses it**, as utils do
  (`utils-placement`). Used by one feature, it lives in that feature. Used by more than one,
  it moves to `src/main/core/<domain>/` (e.g. `core/emulators/emulators.repository.ts`, which
  the emulators feature and the reading of installed platforms share), because features
  never import from each other and nothing shared lives in `features/`.
- The file is `ilnamiki.db` in the app's user data folder (`app.getPath('userData')`).

## 3. Migrations

- Every schema change is a new migration at the end of `MIGRATIONS`, with the next
  `version` (1, 2, 3…) and a `name` that says what it changes.
- **Never edit or remove a migration that has been released** (merged into `main`). Fix
  mistakes with a new migration. Before release, a migration added in the same branch can
  still be changed.
- A migration is plain SQL (`up`). It runs in its own transaction: if it fails, the database
  stays as the previous migration left it.
- Changing a table SQLite can't alter in place (renaming or retyping columns, changing
  constraints) follows SQLite's pattern: create the new table, copy the rows, drop the old
  one, rename the new one.
- The app refuses a database whose version is newer than its migrations (a downgrade);
  never work around that check.
- A migration that adds data the app needs (e.g. default rows) is fine; sample or test data
  never goes in `MIGRATIONS`.

## 4. Schema conventions

- **`STRICT` tables**, so SQLite rejects values of the wrong type.
- **`snake_case`** for tables (plural: `emulators`, `play_sessions`) and columns.
- **Ids:** `id TEXT PRIMARY KEY`, generated in main with `crypto.randomUUID()`. Ids of
  static catalogs (platforms) are their stable string ids.
- **Timestamps:** `INTEGER`, milliseconds since the epoch, named `*_at` (`created_at`,
  `started_at`). Every table of user data has `created_at`; tables whose rows change also
  have `updated_at`.
- **Booleans:** `INTEGER NOT NULL` with `CHECK (column IN (0, 1))`, named as a question
  (`is_default`).
- **Closed sets:** `TEXT` with a `CHECK (column IN (...))` that matches the contract's string
  union.
- **JSON:** `TEXT` with `CHECK (json_valid(column))`, only for data whose shape is truly open.
  Anything queried or related gets real columns.
- **`NOT NULL` by default.** A nullable column means "not set" or "unknown", and
  `DATABASE.md` says which.
- **Foreign keys** always declare what happens on delete (`ON DELETE CASCADE`,
  `RESTRICT` or `SET NULL`), chosen on purpose. They are enforced on every connection.
- **Indexes** for columns used to look up, join or sort often, named
  `<table>_<columns>_index`. Unique rules use `UNIQUE` constraints.
- Paths are stored exactly as the system gives them (absolute), never shortened.

## 5. Queries

- **Always prepared statements with parameters** (`db.prepare(sql).run(value)`), never
  values joined into the SQL string. This is what prevents SQL injection, including from
  paths and names typed by the user.
- Validate arguments from the renderer before they reach a query (`main-renderer-api`).
- Several writes that belong together go in one `transaction()`. Transactions don't nest.
- `node:sqlite` is synchronous and runs on main's thread: keep queries small and indexed,
  and never run long loops of single writes outside a transaction (one transaction for a
  batch is much faster).
- Repositories return the contract's types (camelCase, `null` for missing values), never raw
  rows.

## 6. DATABASE.md

- Every migration updates `DATABASE.md` in the same change: the diagram, the table's
  section, its fields (type, null or not, meaning) and its relations.
- It describes structure and meaning, never real data: no rows, paths or names from anyone's
  machine.
- If `DATABASE.md` and the migrations disagree, the migrations are right; fix the document.

## 7. Testing

- Test against `openDatabase(':memory:')`, which runs the real migrations on a database that
  lives only in memory. Never open a database file in tests.
- Sample data for tests (seeds) lives in fixtures next to the tests
  (`<file>.fixtures.ts`), never in `MIGRATIONS`.
- Test repositories by their behavior: what they return for given rows, what they store,
  and what happens with missing or invalid data.
- Every new migration is covered: a test that applies it on an in-memory database and checks
  the tables, constraints and data it creates.

## 8. Checklist

- [ ] Each new piece of stored data is something the user decided, history, a cache of slow
      work, or data that must be searched or related; live state, static catalogs, files,
      derived values and secrets are kept another way.
- [ ] Schema changes are new migrations at the end; no released migration was edited.
- [ ] Tables are `STRICT` and follow the naming, id, timestamp, boolean and foreign key
      conventions.
- [ ] SQL lives in the domain's repository and uses prepared statements with parameters.
- [ ] Related writes share one transaction.
- [ ] `DATABASE.md` matches the migrations.
- [ ] Tests run on in-memory databases and cover every new migration.
