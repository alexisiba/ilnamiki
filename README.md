# Ilnamiki

<p>
  <img src="https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Claude-D97757?style=for-the-badge&logo=claude&logoColor=white" alt="Claude" />
  <img src="https://img.shields.io/badge/Stitch-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Stitch" />
</p>

Ilnamiki is a console-style emulator frontend that turns a PC into a living-room entertainment
system.

## About

Most emulator frontends look and feel like desktop software or streaming websites. Ilnamiki aims
to feel like the native system menu of a modern video game console instead: a TV-first,
10-foot interface designed to be read from the couch and navigated entirely with a gamepad,
while remaining fully usable with keyboard and mouse.

You pick a console, browse its game library, and jump straight into playing. Along the way,
Ilnamiki keeps track of what you were playing so you can continue right where you left off.

It is built for retro and emulation enthusiasts who want to play their game collection on a TV
or monitor with the experience of a real console, without dealing with menus, file explorers or
emulator configuration screens every time they want to play.

## Why

Emulators are great at running games, but getting from "I have an emulator and some games" to
playing from the couch usually means config files, exact folder names and menus built for a
desk. Ilnamiki wants that whole path, from the first run to playing, to happen with a gamepad,
the way a console does it.

## Status

Ilnamiki is in early development. It runs on **Linux** and plays games through
[RetroArch](https://www.retroarch.com/). What works today:

- A guided first run: add an emulator, see the platforms it plays and add a folder of games
  for each one.
- A library of consoles and their games, played in full screen with RetroArch.
- Play sessions, so Home offers to continue the last game played.
- Gamepad, keyboard and mouse input, with sounds and music behind the menus.
- English and Spanish.

Game metadata and artwork, more emulators and other systems will come later.

Ilnamiki doesn't include any games, BIOS files or emulators: you bring your own.

## Running it locally

### Requirements

- Linux
- [Node.js](https://nodejs.org/) 24 or later
- [pnpm](https://pnpm.io/)
- [RetroArch](https://www.retroarch.com/) as an AppImage, with the cores of the systems you
  want to play, to play games

### Install

```bash
git clone https://github.com/alexisiba/ilnamiki.git
cd ilnamiki
pnpm install
```

### Run

```bash
pnpm dev
```

This opens the app in development mode, reloading as the code changes.

### Other commands

| Command            | What it does                           |
| ------------------ | -------------------------------------- |
| `pnpm test`        | Runs the tests                         |
| `pnpm lint`        | Checks the code with ESLint            |
| `pnpm typecheck`   | Checks the types                       |
| `pnpm build:linux` | Builds the Linux packages into `dist/` |

## Contributing

Ilnamiki is open source and open to anyone who wants to use it, learn from it or help build
it. Criticism, ideas and suggestions are just as welcome as code: open an
[issue](https://github.com/alexisiba/ilnamiki/issues) to share them, or a pull request to
propose a change.

This README will grow as the project does.

## Credits

The photos of the consoles are by [Evan Amos](https://commons.wikimedia.org/wiki/User:Evan-Amos),
who shares his photos of video game hardware on
[Wikimedia Commons](https://commons.wikimedia.org/) for anyone to use. Thank you, Evan.

They aren't part of this repository: Ilnamiki downloads each one from Wikimedia Commons, resized
by Wikimedia and otherwise unchanged, the first time its console shows. Most are in the public
domain or dedicated to it under [CC0](https://creativecommons.org/publicdomain/zero/1.0/); some
are licensed under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). The file and license of each
one are listed in
[`platforms.photos.ts`](src/main/features/platforms/platforms.photos.ts), and each file's page
on Wikimedia Commons (`https://commons.wikimedia.org/wiki/File:<file>`) has its full details.

Console names and the consoles in the photos are trademarks of their owners. Ilnamiki isn't
affiliated with or endorsed by any of them.

## License

[GPL-3.0-or-later](LICENSE)
