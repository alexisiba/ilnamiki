---
name: emulator-modules
description: How Ilnamiki supports each emulator in the main process — one module per known emulator (RetroArch, Eden…) behind one shared EmulatorModule interface, kept apart from how the emulator is installed (AppImage now; Flatpak, Windows executables later), with per-operating-system providers inside each module. Covers the vocabulary (emulator, emulator option, installation; "core" only inside the RetroArch module), where modules live, what a module answers (recognize, version, options per platform, launch, open), platform ids from the shared platform catalog, what is read from the emulator versus written in the module, how to research a new emulator, and testing. Use whenever adding or changing support for an emulator, touching src/main/core/emulators, src/main/core/installedPlatforms or src/shared/platformCatalog, or launching or opening an emulator.
---

# Emulator Modules

Every emulator behaves differently: where it keeps its files, what it needs to start, which
arguments open a game. Ilnamiki keeps each one's knowledge in **its own module**, and the rest
of the app only talks to modules through one interface. Adding an emulator means adding a
module, not adding `if (kind === …)` across the app.

Related skills: `main-renderer-api` (contracts and per-platform providers), `main-database`
(what is stored about emulators), `utils-placement` (pure parsers next to their module).

## 1. Vocabulary

Use these words everywhere: code, contract, database, UI copy and docs.

- **Emulator:** a program the user added (RetroArch, Eden). A row of the `emulators` table,
  identified by its `kind`.
- **Emulator option:** one way an emulator plays one platform. Most emulators have no options
  (their option id is `null`); RetroArch has one per installed core. What an option id means
  is known only to its module.
- **Emulator choice:** an emulator plus one of its option ids (`EmulatorChoice`), what the user
  picks for a platform or a game and what play sessions record.
- **Installation:** how an emulator is installed on this computer, which decides how it is
  run and where its folders are (`EmulatorInstallation`). Only AppImages exist today.

**"Core" exists only inside the RetroArch module**, because it is RetroArch's own vocabulary
(`cores/` folder, `.info` files, `-L`). Outside it (contract, database, other modules,
renderer, i18n), a core is an emulator option. The one exception is user-facing help that
tells the user what to do inside RetroArch's own menus (e.g. "install its cores"), where the
user will see that word.

## 2. Where it lives

```
src/main/core/emulators/
  emulators.repository.ts       ← the emulators the user added (main-database)
  emulatorModules.types.ts      ← EmulatorModule, EmulatorOption, LaunchPlan…
  emulatorModules.ts            ← the list of modules and how to find one
  emulatorStart.ts              ← a module's launch plan turned into the command to run
  installation/                 ← how emulators are installed, for every module
    installation.types.ts       ← EmulatorInstallation, InstallationFolders
    installation.ts             ← installationOf(), picked per operating system
    providers/<os>.ts
  <emulator>/                   ← one folder per module, e.g. retroarch/, eden/
    <emulator>.ts               ← the module: implements EmulatorModule
    <emulator>.parsers.ts       ← pure functions over what it reads (tested with fixtures)
    providers/<os>.ts           ← what depends on the operating system
    providers/unsupported.ts
    fixtures/                   ← real files captured from the emulator
src/shared/platformCatalog/     ← platform ids and their details, shared by every module
```

- A module never imports another module. What two modules share goes next to
  `emulatorModules.types.ts` or in `installation/`.
- Features (`games`, `emulators`, `library`, `platforms`) and `core/installedPlatforms` use
  modules only through `core/emulators`' index (`findModule`, `emulatorStart.ts`) and the
  `EmulatorModule` interface; nothing outside a module's folder imports from inside it.
- Every emulator Ilnamiki starts goes through `startEmulator` (`core/emulatorProcess`) with an
  `EmulatorStart`, so the environment a module asks for always reaches the emulator.

## 3. The interface

A module answers the same questions for its emulator (see `emulatorModules.types.ts` for the
exact types):

| Member          | Answers                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `kind`          | Which known emulator it is (`EmulatorKind`).                                                                             |
| `desktopIds`    | The desktop entry ids that recognize its application.                                                                    |
| `readVersion`   | Its version: declared by the package when it says, or printed by the emulator.                                           |
| `listOptions`   | The options it has now, each with its platform and the extensions of its games. Read live, never stored.                 |
| `prepareLaunch` | The arguments and environment that start a game with one of its options, or `null` when that option isn't there anymore. |
| `prepareOpen`   | The arguments and environment that open it alone, in full screen, to be set up.                                          |

- **Options are per platform.** An emulator without options that plays two platforms returns
  two options, both with id `null`.
- An option id is opaque outside its module: others only store it and hand it back.
- Each option takes its platform's id, name and manufacturer from the shared platform catalog
  when the platform is there. RetroArch also reads them from its cores, for platforms the
  catalog doesn't list yet.
- Launching never shows the emulator's own prompts the user can't answer with a gamepad
  (update checks, first-run dialogs): the module turns them off through its arguments or
  environment when the emulator allows it.

## 4. Installations

- The module knows **what** it needs (e.g. "`prod.keys` in `eden/keys` of my data folder");
  the installation knows **where** that folder is and **how** the program is run. A module
  never computes `~/.config`, `<AppImage>.home` or a Flatpak folder itself.
- Every launch goes through `installation.command(args)`, so a future Flatpak runs as
  `flatpak run <id> …` without any module changing.
- `installationOf()` picks the installation for the current operating system with
  `selectForPlatform`. Today Linux means AppImage, the only format the emulators feature
  accepts. A new installation type (Flatpak, a Windows executable) is added there, and the
  `emulators` table then records which type each emulator is.

## 5. Operating systems

- Ilnamiki ships on Linux and Windows. Whatever a module does differently on each system
  (library file names, default folders) lives in its `providers/<os>.ts`, picked once with
  `selectForPlatform`, with an `unsupported` provider that finds nothing (`[]`, `null`).
- The module's main file holds only what is the same on every system.

## 6. What is read and what is written in the module

- **Read from the emulator** when it declares it in a machine-readable way: RetroArch's core
  info files (platform, extensions, firmware), a package's declared version
  (`X-AppImage-Version`).
- **Written in the module** when the emulator doesn't declare it: Eden's platform and
  extensions, its key and firmware files, its launch arguments. Free text meant for people
  (descriptions, notes, `GenericName`, `Keywords`) is never parsed for data.
- **Unknown is data.** When a module can't know something, it returns `null`, never a guess.

## 7. Platform ids

- Platform ids come from the shared platform catalog (`src/shared/platformCatalog`), whose ids
  are RetroArch's `systemid` values, so the same console is one platform whatever emulator
  plays it. A module for a standalone emulator uses the catalog's id for its platform (e.g.
  `xbox`, never `microsoft_xbox`).
- A platform no RetroArch core declares (e.g. `switch`) gets an id in the catalog following
  RetroArch's style: lowercase, words joined with `_`, the short name RetroArch uses for the
  maker's recent consoles (`wiiu`, `3ds`).
- What belongs to a platform whatever emulator plays it (its name, maker, extensions that
  are never games) goes in the catalog, not in a module.

## 8. Researching a new emulator

Before writing a module, find out from the real package, and note the findings in the
module's doc comments:

1. Its package: format, desktop entry id, declared version, icon.
2. How it prints its version, if it isn't declared.
3. Which platforms it plays and their catalog ids; the extensions of its games.
4. Where it keeps its configuration and data, and which files the user must provide (BIOS,
   keys, firmware) and where it looks for them.
5. Its command-line arguments to start a game in full screen and to open alone.
6. Anything it does on start that a gamepad user can't answer (updaters, dialogs).

Run the emulator only to print its version or help, from a scratch folder, and check whether
it created files in the user's folders; tests never run it.

## 9. Testing

- Test each module's parsers with fixtures of real files captured from the emulator
  (`<emulator>/fixtures/`), and its launch and open arguments as pure functions.
- Never run an emulator, read the user's real folders or start Electron in tests.

## 10. Checklist

- [ ] The emulator has its own module folder implementing `EmulatorModule`, registered in
      `emulatorModules.ts`, and `EmulatorKind` (contract and database check) names it.
- [ ] No code outside the module knows anything specific about this emulator.
- [ ] "Core" appears only inside the RetroArch module.
- [ ] Folders and the command come from the installation, never computed by the module.
- [ ] Operating-system differences are in the module's providers, with an `unsupported` one.
- [ ] Its platforms use catalog ids; new platforms were added to the catalog.
- [ ] Launching and opening turn off prompts a gamepad user can't answer.
- [ ] Parsers are tested with real fixtures; `pnpm typecheck` and `pnpm test` pass.
