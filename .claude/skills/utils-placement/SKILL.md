---
name: utils-placement
description: Where utility functions (utils, helpers) live in Ilnamiki and how they are named — as close as possible to the code that uses them, in a companion file when private to one component or file, in a utils/ folder at the nearest common parent when shared, and in the process-wide shared location from the start when known to be used widely; one file per topic named after what it does, never a catch-all utils.ts, pure functions only (anything with state or side effects goes to core/). Use whenever creating, moving or reusing a helper or utility function, adding a .utils.ts file or a utils/ folder, or when a second piece of code needs a function that already exists elsewhere.
---

# Utils Placement

A **util** is a function that computes something from its inputs: formatting, mapping,
parsing, calculating. This skill decides where it lives and what its file is called.

Related skills: `component-structure` (companion files of a component), `main-renderer-api`
(main, preload and shared layers), `ilnamiki-ui` (features don't import each other),
`react-testing` (tests next to the file).

## 1. One word: `utils`

The project calls them **utils**: the `.utils.ts` suffix and `utils/` folders. Never create
`helpers`, `helpers.ts`, `lib/` or other synonyms for the same idea.

## 2. Utils are pure

A util takes inputs and returns a result: no state, no side effects, no access to the
system, the DOM, Electron, timers or the network.

Anything with state or side effects is not a util and goes to `core/` instead, even when it
is small and shared: hooks, services, event subscriptions, running a command, reading files.
For example, running `busctl` in main belongs in `src/main/core/busctl/`, while a function that
parses its output can be a util.

## 3. As close as possible to its users

Place a util by who uses it, starting as close as possible:

| Used by | Where it lives |
|---|---|
| One component (and its sub-components) | `ComponentName.utils.ts` in the component's folder (see `component-structure`) |
| One non-component file (a module, a provider) | Companion file next to it: `<fileName>.utils.ts`, or a role suffix when one says more (`linux.parsers.ts`) |
| Several components or files under one folder | `utils/<topic>.ts` in the nearest folder that contains all of them |
| Known from the start to be used across the app | The process's shared location (below) |

A util used by a component and its own sub-components stays in the component's
`ComponentName.utils.ts`: the component's folder already is their nearest common parent (e.g.
`getBatteryLevel` and `getWifiLevel` in `TopBarStatus.utils.ts`, used by two of its
sub-components).

### Shared locations

| Scope | Location |
|---|---|
| Renderer-wide | `src/renderer/src/utils/` |
| Main-wide | `src/main/core/` (pure parts may go in `src/main/core/utils/`) |
| Used by both main and the renderer | `src/shared/` |

### Features never share through each other

Features are independent and don't import from each other. When two features need the same
util, their nearest common parent would be `features/`, but nothing shared lives there: the
util goes to the shared location of its process instead.

## 4. One file per topic, named after what it does

- Name the file after the topic it covers, in camelCase like other modules: `time.ts`,
  `batteryLevel.ts`, `textSearch.ts`. Never a generic `utils.ts`, `helpers.ts`, `common.ts` or
  `misc.ts` inside a `utils/` folder.
- **Functions that would change for the same reason share a file** (e.g. `formatTimeSince` and
  `formatPlaytime` in `utils/time.ts`, both turning time into text for the user). Unrelated functions don't,
  even if each is small. Often a topic is a single function, and that's fine.
- **Split by responsibility, not by length.** There is no line limit. As a file grows, check
  whether it still covers one topic; when it mixes several, split it so each part keeps a
  name that says what it does. A long file about one topic is fine.
- **Never compress to stay short.** No clever one-liners, nested ternaries or packed
  expressions to save lines: brevity never beats clarity (see `ilnamiki-ui`, "Lean screens
  and components").
- When a `utils/` folder grows large, group its files by domain in subfolders
  (`utils/text/`, `utils/time/`), not into bigger files.
- Export each function by name; no default exports and no barrel that re-exports a whole
  folder of unrelated topics.

## 5. Moving a util

When a util gains a user outside its current scope, move it **up** to the next place from the
table, in the same change:

- Move its tests with it and keep their name in sync with the file (`time.ts` →
  `time.test.ts`).
- Update every import. Never import a util from inside another component's folder or from
  another feature; that import is the signal to move the util.
- Rename the file if its new home needs a clearer topic name (a function in
  `TopBarStatus.utils.ts` that moves to `utils/` becomes `utils/<topic>.ts`).
- When a util ends with a single user again, it may move back down; don't leave shared code
  that only one place uses.

## 6. Tests

Every util with logic has tests next to its file (`<fileName>.test.ts`), per `react-testing`
in the renderer and `main-renderer-api` in main. Utils are pure, so their tests need no mocks.

## 7. Checklist

- [ ] It is pure; anything with state or side effects went to `core/` instead.
- [ ] It lives as close as possible to its users: companion file for one user, `utils/` at the
      nearest common parent for several, the shared location when used across the app.
- [ ] No util is shared between features through a feature folder.
- [ ] The file is named after its topic; no catch-all `utils.ts`/`helpers.ts`; no `helpers`
      naming anywhere.
- [ ] Functions in one file share a reason to change; files are split by topic, never
      compressed to look shorter.
- [ ] Moved utils took their tests along and every import was updated.
