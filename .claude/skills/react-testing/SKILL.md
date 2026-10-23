---
name: react-testing
description: How to test the Ilnamiki renderer (React + TypeScript) — what must be tested (logic and behavior) and what must not (purely visual styling), the tooling (Vitest, React Testing Library, user-event, jsdom), where test files live, how to query and interact like a user, and how to handle i18n, input actions, timers and the preload bridge. Use whenever creating or changing a feature, component, hook or function with logic, and whenever writing, fixing or reviewing tests in this project.
---

# React Testing

Every new feature, and every change to logic, ships with tests in the same change. Tests
describe **behavior**, not implementation and not appearance.

Related skills: `ilnamiki-ui` (product rules the behavior must follow) and
`component-structure` (where test files go).

## 1. What to test

Test anything that decides **what happens**:

- **Hooks and functions** with logic: state transitions, calculations, formatting, mapping
  (e.g. keys to input actions, the current time refreshing each minute).
- **Component behavior**: what is rendered for a given state or data (e.g. an empty state
  when there are no emulators), which element is selected, what changes after an action.
- **Interactions**: keyboard and mouse produce the same result, as the input rules require.
  Test both paths when a component supports both.
- **Navigation rules**: limits and wrapping (e.g. "down" on the last item does nothing),
  focus restoration, `back` behavior.
- **Text wiring**: the right translated text appears for a state. Not the copy itself.
- **Integration with the preload bridge**: calls made through `core/ipc` and how the UI
  reacts to their results and errors.
- **Bug fixes**: add a test that fails without the fix.

## 2. What not to test

Do not test pure presentation:

- Position, layout, size, padding, margins, spacing.
- Colors, gradients, shadows, glow, borders, radii, fonts.
- Animations and transitions.
- CSS class names, CSS Modules output, or the presence of a style.
- Snapshot tests of markup.

If a visual difference represents **state** (e.g. "this button is selected"), test the state,
not the style. Components should expose that state semantically (`aria-selected`,
`aria-current`, `aria-pressed`, `aria-disabled`, …) so tests and assistive technologies can
read it. If a component only shows a state through a CSS class, add the matching attribute
when you write its test.

## 3. Tooling

| Tool | Role |
|---|---|
| Vitest | Test runner and assertions, sharing the Vite configuration |
| jsdom | Browser-like environment for renderer tests |
| React Testing Library | Rendering components and querying them like a user |
| `@testing-library/user-event` | Realistic keyboard and mouse interactions |
| `@testing-library/jest-dom` | DOM matchers (`toBeInTheDocument`, `toHaveAttribute`, …) |

Run the whole suite with `pnpm test`. Never commit with failing tests, and never skip or
delete a failing test to make the suite pass without the user's approval.

## 4. Where tests live

Tests sit next to the code they test, using the name of that file:

```
EmulatorSetup/
├── EmulatorSetup.tsx
├── EmulatorSetup.test.tsx
└── ...
core/input/
├── useInputAction.ts
└── useInputAction.test.ts
```

- Components follow `component-structure`: `ComponentName.test.tsx`.
- Hooks and modules: `<fileName>.test.ts`.
- Shared test helpers (render with providers, mocks of `window.api`) live in
  `src/renderer/src/test/`, never inside a component folder.

## 5. How to write tests

### Query like a user

Prefer, in this order: `getByRole` (with `name`), `getByLabelText`, `getByText`. Use
`getByTestId` only when nothing accessible exists. Never query by class name or DOM
structure.

```tsx
const download = screen.getByRole('button', { name: 'Download RetroArch' })
expect(download).toHaveAttribute('aria-selected', 'true')
```

### Interact like a user

Use `user-event`, not `fireEvent`, and drive the input the way the user would:

```tsx
const user = userEvent.setup()
await user.keyboard('{ArrowDown}')
await user.hover(screen.getByRole('button', { name: 'I already have an emulator installed' }))
```

Features react to input actions from `core/input`. Test components through real key presses
(which go through `core/input`), and test the key-to-action mapping once in `core/input`'s
own tests.

### i18n

Render with the real i18n setup and resources, in English (the default language). Assert on
the English text a user would see; do not mock `t` and do not assert on translation keys.
Locale files themselves are not unit tested beyond "both languages have the same keys" if
such a check exists.

### Time and timers

Use Vitest fake timers (`vi.useFakeTimers()`, `vi.setSystemTime()`) for anything that
depends on the clock or on delays. Never wait for real time in a test.

### Preload bridge and system access

The renderer only talks to the system through `window.api`. Mock it with a shared helper
from `src/renderer/src/test/`; never let a test touch Node, Electron, the network or the
file system.

### Good tests

- One behavior per test, with a name that states it: `it('selects the next action on down')`.
- Arrange, act, assert. Keep setup minimal and local.
- No dependence on test order; restore mocks and timers after each test.
- Test the public behavior of a component, not its internal state or private helpers.

## 6. Checklist

Before considering a change done:

- [ ] Every new or changed piece of logic has tests in the same change.
- [ ] Tests cover the main behavior, the edges (limits, empty data, errors) and both
      keyboard and mouse paths when supported.
- [ ] No tests for styling, layout or snapshots.
- [ ] Queries use roles and accessible names; state is read from semantic attributes.
- [ ] No real timers, network, file system or Electron APIs in tests.
- [ ] `pnpm test` passes.
