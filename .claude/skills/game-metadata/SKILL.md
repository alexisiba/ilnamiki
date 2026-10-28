---
name: game-metadata
description: How Ilnamiki finds information and artwork about the user's games in the main process — one core module (src/main/core/gameMetadata) with providers in two stages, the same way emulators have modules — identifiers (a game's file → its identity) and content providers (an identity → details, artwork or a description, each an optional method). Covers the vocabulary, the providers in use (libretro-database from RetroArch's .rdb files, libretro-thumbnails) and their order per kind, the fallback rule (ask providers in order once, take each value from the first that has it, keep what was confirmed), how a game is identified (CRC or exact file name only, never a guess), which title is shown, what is stored and where artwork files go, the background work that starts when a folder is saved, network rules, how to add a provider, and testing. Use whenever adding or changing a metadata provider, identifying games, downloading or storing artwork, touching src/main/core/gameMetadata, the game_metadata or game_images tables, or EmulatorModule.listGameDatabases.
---

# Game Metadata

Ilnamiki shows each game with its real name, its artwork and what is known about it (year,
developer, genre). That information comes from **providers**, each one a source with its own
format, behind **shared interfaces**. Adding a source means adding a provider, not adding
`if (source === …)` across the app. Update this skill whenever a provider is added or a rule
changes.

Related skills: `emulator-modules` (where the RetroArch databases come from),
`main-database` (what is stored and how), `main-renderer-api` (how metadata reaches the
renderer), `utils-placement` (pure parsers next to their provider).

## 1. Vocabulary

- **Metadata:** everything known about a game besides its file: its identity, details,
  artwork and description.
- **Identity:** which game a file is, in a provider's database (the database's name and the
  game's name in it, e.g. `Nintendo - Game Boy` / `Metal Gear Solid (USA)`). Content
  providers look games up by it.
- **Content kinds:**
  - **Details:** title, release year and month, developer, publisher, genre, players.
  - **Artwork:** images of kinds `cover` (box front), `title-screen` and `screenshot`
    (`title_screen` in SQL).
  - **Description:** a text about the game, in one language.
- **Identifier:** a provider that tells a game's identity from its file.
- **Content provider:** a provider that gives one or more content kinds for an identity.
- One source can be both (the `.rdb` identifies games and gives their details): it is one
  provider folder implementing both interfaces.

## 2. Where it lives

```
src/main/core/gameMetadata/
  gameMetadata.types.ts          ← Identifier, ContentProvider, GameIdentity, GameDetails…
  gameMetadata.ts                ← main's side: finds the sources, starts the worker, the queue
  gameMetadata.providers.ts      ← the providers in order, per stage and per kind, for one run
  gameMetadata.fallback.ts       ← the fallback rule (section 4), pure over any providers
  gameMetadata.describe.ts       ← one game through both stages, unless its file is unchanged
  gameMetadata.worker.ts         ← the worker: describes the games it gets, posts each one
  gameMetadata.worker.types.ts   ← what main and the worker send each other
  gameMetadata.repository.ts     ← game_metadata, and the SQL of the title shown
  gameMetadataQueue.ts           ← one run at a time, written in batches (dependencies passed in)
  artwork.ts                     ← downloads an image and writes its file (fetch and files passed in)
  artworkUrls.ts                 ← the images' URLs: made, read back, and the SQL to list them
  artworkProtocol.ts             ← serves those URLs from the artwork files (Electron)
  <provider>/                    ← one folder per provider, e.g. libretroDatabase/
    <provider>.ts                ← implements Identifier and/or ContentProvider
    <provider>.parsers.ts        ← pure functions over what it reads
    <provider>.files.ts          ← how it reads files (a reader passed in, replaced in tests)
    <provider>.<topic>.ts        ← other parts of a larger provider, e.g. .checksums, .index
    <provider>.fixtures.ts       ← test helpers that build its source's data in memory
    fixtures/                    ← a few records cut from real files, for the parser's tests
```

- Providers keep what they read (whole databases) only while they live:
  `gameMetadata.providers.ts` makes them anew in each run's worker, so nothing large stays in
  memory between runs.
- Everything the worker imports (providers, `describe`, `fallback`, types) must run without
  Electron or the app's database: what it needs from them (e.g. where the databases are) main
  finds before the run and hands it over as `ProviderSources`.

- It is a `core/` module because several features use it (saving a folder starts it; games,
  home and library read what it stored). Features use it only through its index.
- A provider never imports another provider. What two providers share goes next to
  `gameMetadata.types.ts`.
- Nothing outside a provider's folder knows its source's format.

## 3. The two stages

**Stage 1, identifiers.** _Which game is this file?_

```ts
interface Identifier {
  id: MetadataProviderId
  /** The game's identity, or null when this provider doesn't know the file. */
  identify(game: GameToIdentify): Promise<GameIdentity | null>
}
```

**Stage 2, content providers.** _What do you have for this identity?_ Each implements only
the kinds it can give; a missing method means it never gives that kind.

```ts
interface ContentProvider {
  id: MetadataProviderId
  details?(identity: GameIdentity): Promise<GameDetails | null>
  artwork?(identity: GameIdentity): Promise<ArtworkUrl[]>
  description?(identity: GameIdentity, language: string): Promise<string | null>
}
```

See `gameMetadata.types.ts` for the exact types. Every provider of a kind returns the same
shape, so the core treats them all alike.

- **Without an identity there is no stage 2.** An unidentified game shows its file name and
  the default images.
- Content providers that need another kind of identity (e.g. an IGDB id) get it added to
  `GameIdentity` by an identifier, never by looking it up themselves.

## 4. The fallback rule

Each stage and each content kind has its **own ordered list of providers** in
`gameMetadata.providers.ts`. For each one:

1. Ask the first provider.
2. **Each value comes from the first provider that has it** and is never overwritten or
   merged with a later one's. A value is one field of the details, one artwork kind or one
   description: a title from one provider and a year from another is fine, and so is a cover
   from one and a screenshot from another.
3. If something is still missing (a field, an artwork kind, or nothing was found), ask the
   next provider, only for what is missing.
4. Stop when everything is filled or every provider was asked. **What was confirmed is kept;
   what no provider had stays empty.**

- **Asked once.** A game whose providers were all asked is not asked again, whatever is
  missing, unless its file changes (size or modification time). A provider that couldn't
  answer (network down) doesn't count as asked: it is tried again later.
- A game the provider doesn't know is an answer (`null` / empty), not an error. A provider
  throws `MetadataUnavailableError` only when it couldn't look (nothing to look in yet for the
  platform, no network), so the game gets no row and is tried again on a later run.

## 5. Providers and order

| Stage / kind | Order | Provider              | Source                                                                                                     |
| ------------ | ----- | --------------------- | ---------------------------------------------------------------------------------------------------------- |
| Identify     | 1     | `libretro-database`   | RetroArch's `.rdb` files on the user's computer, offline                                                   |
| Details      | 1     | `libretro-database`   | The same `.rdb` record: title, release year and month, developer, publisher, genre, players                |
| Artwork      | 1     | `libretro-thumbnails` | `https://thumbnails.libretro.com/<database>/<Named_Boxarts\|Named_Titles\|Named_Snaps>/<name>.png`, no key |
| Description  | —     | none yet              | A separate provider will be chosen; `.rdb` descriptions are not used                                       |

- Providers must work without a key the user has to get, or be turned on by the user with
  their own account. Not used for that reason: ScreenScraper, IGDB, TheGamesDB, MobyGames,
  SteamGridDB.

### libretro-database

- **Where the databases come from:** the emulator modules, through
  `EmulatorModule.listGameDatabases` (only RetroArch implements it): which database names
  each platform uses (its cores' `database` field) and the folder they are in
  (`content_database_path` in `retroarch.cfg`). The provider never reads RetroArch's folders
  itself. A platform without a database it can read (no RetroArch, its databases not
  downloaded, a platform RetroArch doesn't play such as the Switch) means it couldn't look: it
  throws `MetadataUnavailableError`, never shown to the user, and the game is tried again once
  RetroArch has that database.
- **Identification, in this order, and nothing else:**
  1. **CRC32 of the file**, after removing known copier headers (SNES: 512 bytes when the size
     is 512 over a multiple of 1024; NES: the 16-byte iNES header); the CRC with and without
     the header are both tried. Archives (`.zip`, `.7z`) and files over 512 MB (large disc
     images) skip this step.
  2. **Exact file name**: the file's name equals a game's `rom_name` (arcade sets, e.g.
     `kof2002.zip`) or its name without extension equals a game's `name` (No-Intro and Redump
     names).
- **Archives are known by their name only.** The library only has archives whose platform's
  emulator declares that extension, and those emulators play them as they are (arcade sets
  of many chips), which the databases list by the archive's name. Nothing inside an archive
  is read.
- **Never guess.** No fuzzy or partial title matching: a similar name could be another game,
  region or hack. Unidentified is fine.
- A game may have several records with the same name in a database (one per source the
  database merged, e.g. a SNES Classic dump): they are the same game, so its details join what
  each record says, the first winning.
- `.rdb` files are msgpack records after a 16-byte header; read them with the provider's own
  reader (no dependency). Load each database once per run, not once per game.

### libretro-thumbnails

- Builds URLs from the identity: the database name is the system folder, and the game's name
  is the file name with each of ``& * / : ` < > ? \ | "`` replaced by `_`.
- It knows only games `libretro-database` identified: the images are named after its names.
- It names all three images without asking the server; which exist is only known when they
  are downloaded. A missing image (404) means it has no image of that kind, and that kind is
  asked of the next artwork provider.
- Its images are PNGs about 512 px wide and under 1 MB, fine for the TV as they are: nothing
  is resized.

## 6. Titles

- `games.title` stays what the scan found (the file name without extension). The details'
  title is stored apart, so a different identification later never loses anything.
- **The title shown is the details' title when there is one, else the file name.** Queries
  choose it with `SHOWN_TITLE` and `JOIN_GAME_METADATA` from the module's index; the renderer
  never decides.
- The libretro title is the database name made readable: tags in `()` and `[]` dropped, and a
  trailing article moved back (`Legend of Zelda, The - Link's Awakening` →
  `The Legend of Zelda - Link's Awakening`). A pure function, tested.

## 7. What is stored (main-database)

Metadata is a **cache of slow work**: it can be found again, but it takes time and network.
One table per kind, each marking what was asked:

- `game_metadata`: one row per game whose providers were all asked: its identity and how it
  was found (`crc`, `file-name`, or `NULL` when unidentified), the details' fields (nullable),
  and the file's size and modification time when it was looked at.
- `game_images`: one row per game and artwork kind once every artwork provider was asked: the
  file's path, or `NULL` when no provider had it. A game's details found again (its file
  changed) delete its rows, so its artwork is found again for its new identity.
- `game_descriptions` (planned, when a description provider exists): one row per game and
  language.
- **Artwork is files**, in `<userData>/artwork/<gameId>/<kind>.<ext>`, written whole or not at
  all; the database keeps the path. A file is replaced when its kind is downloaded again.
- Rows are written only once every provider of that stage or kind answered; a game still
  waiting for a provider that couldn't answer has no row there.

### Showing it (main-renderer-api)

- The contract's games carry `artwork: GameArtwork` (`cover`, `titleScreen`, `screenshot`),
  each a URL or null, and `GameDetails` the details' fields, null while unknown. Repositories
  read them with `ARTWORK_COLUMNS` and `toGameArtwork` from the module's index.
- **Images are URLs, never paths or data URLs**:
  `ilnamiki-artwork://game/<gameId>/<kind>?v=<looked_at>`, served by main
  (`artworkProtocol.ts`, `protocol.handle`) from the file the database keeps for that game and
  kind, only inside the artwork folder. The renderer can name a game and a kind, never a file.
  `v` changes when an image is downloaded again, so no old copy stays cached. The scheme is in
  the renderer's CSP (`img-src`).
- In the renderer (`utils/gameArtwork.ts`): cards show the cover (`coverOf`); what shows behind
  a game is its screenshot, else its title screen, else the generic image (`backdropOf`).
  Screenshots and title screens are at the console's resolution and drawn with
  `image-rendering: pixelated`; covers and generic images are drawn smoothly.
- Metadata (genre, developer) is shown as the source has it, never translated; only the app's
  own words around it are (e.g. "2 players").

## 8. Background work

- It starts **when a folder is saved** (`addFolder`, `updateFolder`), after the transaction,
  for the games saved: never after a scan alone, because the user may still not save it.
- It also starts when the app starts, for games missing a row or whose file changed.
- **Main never does the heavy work.** One queue in main runs one run at a time; what is asked
  for during a run (other folders) joins the next one. Each run:
  1. Main lists the games to look at and finds the sources (`ProviderSources`), both short.
  2. A `worker_threads` worker, started for the run (electron-vite's `?nodeWorker` import,
     loaded only when a run starts) and gone when it ends, reads the databases, works out
     checksums and describes the games one at a time, posting each as soon as it is done.
  3. Main writes what the worker posts in batches (one transaction per 50 games), so it only
     does short writes, whatever the library's size.
- Stopping (the app quitting) ends the worker; what was posted is still written, and the rest
  is done on the next start.
- For each game the worker posts its details first, then looks for its artwork and posts it
  apart: a kind that needs the network never holds back one that doesn't, so details are kept
  offline too, and artwork is looked for on a later run. A game whose details are unchanged
  still gets its artwork when it was never all asked (with the identity stored).
- A game's three artwork kinds download at the same time; games go one after another.
- It is **invisible for now**: no progress UI. Errors are logged, never shown. A later UI will
  show that metadata is downloading.
- **Screens follow it by an event, never by polling.** Each time a batch is written, main
  sends `games.onMetadataChanged` with the batch's game ids (`onGamesDescribed` in the module,
  sent to every window by the games feature); while nothing is being described, nothing is
  sent and nothing runs. The renderer's `core/ipc` hooks of games read again when it comes:
  lists always, a single game's (details, the last played game) only when its id is in it.
  Subscriptions last while the screen using them is shown.
- Starting a game never waits for metadata.

## 9. Network

- Only what needs it uses the network, through the core's downloader (`artwork.ts`): a 20 s
  timeout, `User-Agent: Ilnamiki/<version>`, images up to 10 MB of type PNG, JPEG or WebP.
- A 404 or 410 means the image isn't there; any other failure (no connection, the server
  failing) throws `MetadataUnavailableError`: that game's artwork gets no rows and the rest of
  the run skips artwork, since every game would wait for the same failure. It is tried again on
  the next run, and it is never an error the user sees.
- Artwork belongs to its owners: it is downloaded on the user's computer, never committed to
  the repository or shipped in a build.

## 10. Adding a provider

1. Check the source's terms: free to use from an open-source app, without a key the user must
   get (or turned on by the user with their own account).
2. Add its folder implementing `Identifier` and/or the `ContentProvider` methods it can give,
   with parsers, an in-memory fixtures helper, and its id to `MetadataProviderId`.
3. Place it in the order of each stage or kind it serves in `gameMetadata.providers.ts`; what
   it needs from main (files, settings) goes in `ProviderSources`, found in `gameMetadata.ts`.
4. If it gives a field or kind not stored yet, add it with a migration (`main-database`) and
   to the types.
5. Update the table in section 5.
6. Decide, and write here, whether games already asked should ask the new provider for what
   they are missing (by the "asked once" rule, they otherwise won't).

## 11. Testing

- **The parser of a format is tested with fixtures cut from real files** (`fixtures/`: a few
  records of a real `.rdb`, a few hundred bytes), so it is checked against what the source
  really writes, not against a helper written with the same understanding of the format. The
  app never reads them: it gets its data from the user's emulators or the network.
- **Everything else builds its data in memory**: cases a real file can't give (a game whose
  CRC matches, a broken or missing database) are written in the test with the provider's
  `<provider>.fixtures.ts` helpers (e.g. `encodeRdb(records)`) and read through an in-memory
  reader (`memoryReader`) instead of the disk's. Tests never write files.
- Check a new format's parser once against all the real files on a development machine,
  outside the tests, and write in the parser's comments what it was checked with.
- Test identification, title cleaning and the fallback rule as pure functions, the fallback
  with fake providers.
- Tests never use the network (fetch is passed in), never read the user's folders and never
  run an emulator.
- The repository and its migration are tested on in-memory databases (`main-database`).

## 12. Checklist

- [ ] Identifiers implement `Identifier`; content providers implement only the kinds they
      give.
- [ ] Providers don't download, write files or use the database; the core does.
- [ ] Each value comes from the first provider that has it; later ones only fill what is
      missing; what nobody had stays empty.
- [ ] A game is asked once, unless its file changes or a provider couldn't answer.
- [ ] Games are identified only by CRC or exact file name; nothing is guessed.
- [ ] The title shown is the details' title when there is one, else the file name.
- [ ] Work starts when a folder is saved or the app starts, never after a scan alone.
- [ ] Artwork is files in the app's data folder; the database stores their paths.
- [ ] Parsers are tested with fixtures cut from real files; other tests build their data in
      memory; no test writes files or uses the network; `pnpm typecheck` and `pnpm test`
      pass.
- [ ] Section 5 lists every provider in use.
