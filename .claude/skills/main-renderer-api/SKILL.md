---
name: main-renderer-api
description: How the Electron main process and the renderer talk in Ilnamiki — every interaction is a typed API defined by a platform-agnostic contract in src/shared, implemented in main by per-platform providers, exposed by the preload as window.api and consumed by the renderer only through core/ipc. Covers where each piece lives, contract and data rules, platform providers, requests and events, errors and unavailable data, security boundaries, testing and changing a contract. Use whenever adding, changing or consuming anything that crosses between main and the renderer (system information, files, processes, emulators, hardware, settings on disk), or touching src/shared/api, src/main/features, src/preload or core/ipc.
---

# Main ↔ Renderer API

The renderer never knows how the system is read. It depends on a **contract**: the data it
will receive and the operations it can call. Main **implements** that contract, choosing how to
obtain the data on each platform, and always returns the same shapes. Linux may read sysfs and
D-Bus, Windows a native API, macOS IOKit: the renderer sees no difference.

Related skills: `ilnamiki-ui` (the UI never touches system or Electron APIs), `react-testing`
(mocking `window.api`).

## 1. The layers

Each area of the system is a **domain** (e.g. `controllers`, `emulators`, `library`). A domain
spans four layers, always in this order of dependency:

```
src/shared/api/<domain>.ts          ← contract: data types, API interface, channel names
src/main/features/<domain>/         ← implementation
  <domain>.service.ts               ← picks the provider for the current platform
  <domain>.ipc.ts                   ← registers the IPC handlers of the contract
  providers/<platform>.ts           ← how the data is obtained on each platform
src/preload/api/<domain>.ts         ← exposes the contract on window.api.<domain>
src/renderer/src/core/ipc/          ← the only renderer code that touches window.api
```

- `src/shared/api/index.ts` composes every domain into one `Api` type, which types
  `window.api` in `src/preload/index.d.ts`.
- Every layer imports the contract through the `@shared` alias (`@shared/api`), configured in
  `electron.vite.config.ts`, both tsconfigs and `vitest.config.mts`.
- `shared` imports nothing from main, preload or renderer. Main and preload import the
  contract; the renderer imports only its types.
- Main and preload never import from each other except through the contract.

## 2. The contract

The contract is the API's documentation. Write it so a renderer developer can use the domain
without reading main.

```ts
// src/shared/api/controllers.ts
export type ControllerConnection = 'usb' | 'bluetooth'

export interface ControllerStatus {
  connection: ControllerConnection
  /** 0–100, or null when the controller does not report its battery. */
  batteryPercent: number | null
}

export interface ControllersApi {
  /** Status of every connected controller, in the order the system lists them. */
  getStatus(): Promise<ControllerStatus[]>
}

export const CONTROLLERS_CHANNELS = {
  getStatus: 'controllers:get-status'
} as const
```

- **Data only.** Plain, structured-clone-serializable values: strings, numbers, booleans,
  `null`, arrays, plain objects. No classes, functions, `Date` (use ISO strings or epoch ms,
  and say which), `Map`/`Set`, Electron or Node types.
- **Domain language, not system language.** `connection: 'usb'`, never `bustype: '0003'`;
  `batteryPercent`, never a D-Bus property name. No field reveals which platform produced it.
- **Explicit units and ranges** in the name or a doc comment (`durationMs`, `0–100`).
- **Closed sets are string unions**, so the renderer can switch over them exhaustively.
- **Every method is async** (`Promise`) and every event subscription returns an unsubscribe
  function, even when today's implementation could be synchronous.
- **Channel names** are `<domain>:<action>` in kebab-case and live only in the contract, so
  main and preload cannot drift apart.
- Every exported type and method has a short doc comment saying what it means, not how it is
  obtained.

## 3. Platform providers

A provider implements the domain for one platform behind one internal interface:

```ts
// src/main/features/controllers/controllers.service.ts
import { selectForPlatform } from '../../core/platform'

export const controllersService: ControllersProvider = selectForPlatform(
  { linux: linuxControllersProvider },
  unsupportedControllersProvider
)
```

- Platform detection lives in `src/main/core/platform` (`Platform` is `'linux' | 'windows' |
  'macos'`; `currentPlatform` is `null` on anything else). Services pick their provider
  **once** with `selectForPlatform`. Nothing else reads `process.platform`.
- Every domain has an `unsupported` provider that returns the contract's "nothing available"
  value (`[]`, `null`), so every platform answers with valid data.
- A provider returns contract types, already normalized: it converts system values into the
  domain's units and unions before returning. Nothing system-specific leaks past it.
- **Split reading from parsing.** A provider has functions that read the system (files,
  commands, native calls) and pure functions that turn their raw output into contract data.
  Only the pure functions hold logic; they are what the tests cover.
- Prefer what the platform already provides (files, bundled command-line tools, standard
  services) over new dependencies. A native module or library needs the user's approval
  first, as any dependency does.
- Run external commands with `execFile` (or `spawn`) and an argument array, never a shell
  string, and with a timeout.

## 4. Requests, events and missing data

- **Requests** use `ipcRenderer.invoke` / `ipcMain.handle`. One channel per method.
- **Events from main** (something changed without the renderer asking) use
  `webContents.send` and are exposed as `on<Event>(listener)` returning an unsubscribe
  function. Use them only when polling would be wasteful or too slow; for slow-changing data,
  a request the renderer repeats is simpler and acceptable.
- **Unavailable is data, not an error.** A feature the platform or hardware cannot provide
  returns its empty value (`null`, `[]`, or a field designed for it). Never invent a value
  to fill the gap: the UI decides what to show when data is missing.
- **Errors are for failures.** Unexpected failures reject the promise. The handler logs the
  details in main; the renderer handles the rejection and shows a state the user can
  understand, never raw error text.

## 5. Security boundaries

- The preload exposes **only the contract's methods** through `contextBridge`. Never expose
  `ipcRenderer`, a generic `invoke(channel, …)`, `require`, or Node and Electron objects.
- Preload methods are thin: call the channel and return the result. No logic.
- Main **validates every argument** coming from the renderer before using it (type, range,
  allowed values). Paths, commands and identifiers are never trusted as received.
- Handlers return only what the contract declares, never extra system details.

## 6. Consuming the API in the renderer

- Features and components never read `window.api`. `core/ipc` wraps each domain in functions
  and, where useful, hooks (e.g. `useControllerStatus`), and features import those.
- Hooks own the timing (when to request, how often to refresh, when to subscribe) and clean
  up on unmount.
- The renderer handles both missing data and rejected promises explicitly.

## 7. Testing

- **Renderer:** mock `window.api` with the shared helper in `src/renderer/src/test/`, typed
  against the contract (see `react-testing`). Test how the UI reacts to each data case,
  including empty values and rejections.
- **Main:** test each provider's pure parsing functions with fixtures of real raw output
  captured from the system (sysfs contents, command output). Never run real system commands,
  touch real files or start Electron in tests. Main tests sit next to their file
  (`<fileName>.test.ts`) and run in Vitest's `main` project, with the `node` environment;
  renderer tests run in the `renderer` project, with jsdom. `pnpm test` runs both.
- Name fixtures after what they represent (e.g. `bluetooth-controller`, `wired-controller`).

## 8. Changing a contract

- A contract change updates **every layer in the same change**: shared, main (all providers,
  including `unsupported`), preload, `core/ipc` and the tests.
- Prefer adding fields over changing or removing them; when a field changes meaning, rename
  it.
- `pnpm typecheck` must pass: it is what proves the layers still agree.

## 9. Checklist

- [ ] The contract lives in `src/shared/api/<domain>.ts`, has doc comments, and contains only
      serializable domain data.
- [ ] No field, name or value reveals which platform or system API produced the data.
- [ ] The service picks the provider once; an `unsupported` provider exists.
- [ ] Providers split reading from parsing; parsing is tested with real fixtures.
- [ ] Missing data is returned as data; only failures reject.
- [ ] The preload exposes only contract methods; main validates every argument.
- [ ] The renderer uses the API only through `core/ipc`.
- [ ] Every layer was updated together and `pnpm typecheck` and `pnpm test` pass.
