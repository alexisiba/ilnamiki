---
name: ilnamiki-ui
description: Global principles for building anything user-facing in Ilnamiki — a console-style emulator frontend for the living room, designed for big screens and gamepad navigation, with full keyboard and mouse support. Describes the mindset and project-wide rules to keep in mind (product vision, input, focus, readability at a distance, visual consistency and icons, i18n, code boundaries), not fixed designs. Use before creating or changing any screen, feature, component, style, translation or interaction in this project.
---

# Ilnamiki UI

Ilnamiki is an emulator frontend that turns a PC into a living-room entertainment center. This
skill describes **what to keep in mind** when building it, not how each screen must look.
Designs, screens and layouts will change and grow over time; the principles below should not.

Related sources of truth:

- **`DESIGN.md`** (repo root): the current visual design system.
- **`src/renderer/src/theme/variables.css`**: the design tokens implemented as CSS variables.
- **`component-structure` skill**: folder and file conventions for components.
- **`a11y` skill**: accessibility rules every user-facing component must follow from its first
  version; **`a11y-review` skill** to audit them.

If these sources and the code disagree, stop and ask the user which one is right.

## How to use this skill

- Treat everything here as principles, not specs. Express *what* a screen needs (e.g. "a
  screen should have a clear title so the user knows where they are"), not a fixed *how*
  (e.g. "the title is always 'Ilnamiki' in the top-left corner").
- There is no fixed set of screens and no fixed layout for any screen. When creating or
  redesigning one, propose the layout and confirm it with the user instead of assuming one.
- When something in the existing UI conflicts with a principle here, point it out.

## 1. Product vision

- **An entertainment center for the TV.** It must feel like the native system menu of a modern
  video game console, used from the couch.
- **A console, not a website.** Avoid browser metaphors and patterns that only make sense with
  a mouse on a desk (hover-only actions, right-click menus, dense grids, visible scrollbars,
  discoverability that depends on tooltips).
- **Not a streaming app.** Avoid reproducing streaming-service layouts.
- **Its own identity.** Take inspiration from consoles, but do not copy any specific one.
- **Calm and focused.** Few elements on screen, one clear focal point, nothing competing for
  attention.

When a request would push the UI toward "web" or "streaming", say so before implementing it.

## 2. Input: gamepad first, keyboard and mouse always

- **The gamepad is the primary input.** Every flow must be comfortable with a controller alone.
- **Keyboard and mouse have full parity.** Anything the gamepad can do, keyboard and mouse can
  do too. No feature is exclusive to one device.
- **Think in actions, not devices.** Features react to semantic actions (navigate, confirm,
  back, …) provided by the app's input layer, not to raw device events. If a new action is
  needed, add it to the input layer rather than listening to devices in a feature.
- **Fixed and contextual actions.** Some actions mean the same everywhere and must never be
  repurposed: directions, confirm, back, switching top-level sections and opening the system
  menu. Others are contextual and generically named (secondary, tertiary, previous/next
  group): each screen decides what they do and labels them in its hints. Prefer an existing
  contextual action over inventing a new one; the bindings live in the input layer.
- **Hints name actions, not buttons.** Screens show a hint by action (and, for contextual
  actions, a label of what it does here); the input layer resolves which button glyph to
  draw for the device in use. Draw a specific button directly only when the button itself
  is the subject (e.g. a tutorial).
- **Every button action has an on-screen equivalent** that can be focused or clicked.
- **Hints match the device in use.** Button and key hints reflect the last-used input device
  and the actions available in the current context.
- **Text entry works without a keyboard** (an on-screen keyboard navigable with the gamepad),
  while still accepting a physical keyboard.
- **Responsive input.** Navigation reacts immediately; animations never block the next input.

## 3. Focus and navigation

- **There is always exactly one focused element**, and it is obvious from across the room.
- **Focus is never lost.** After closing a dialog, switching views or returning to a screen,
  focus goes back to a sensible place (usually where it was).
- **Navigation is spatial.** Directional input moves focus to what is visually in that
  direction, handled by the shared navigation layer, not hand-wired per feature.
- **Mouse follows the same model.** Pointing at an element focuses it; clicking confirms it.
- **Back always works** and is predictable: it closes or returns one level.

## 4. Readability at a distance (10-foot UI)

- Everything is read from a couch, a few meters away: large text, generous spacing, high
  contrast.
- Keep interactive content inside a safe area away from screen edges.
- Prefer fewer, larger elements over dense information.
- The user should always know where they are and what they can do (e.g. a clear title or
  context for the screen, and visible hints for available actions).

## 5. Visual consistency

- **Use the design system, don't hard-code.** Colors, typography, spacing, radii, shadows,
  durations and easings come from the theme tokens. If a value you need does not exist, add a
  token (and update `DESIGN.md` if it is a design decision) instead of inlining it.
- **Color has meaning.** Accent colors signal focus, actions and state; status colors are for
  feedback, not decoration.
- **Icons come from Lucide** (`lucide-react`). Do not mix in other icon libraries or ad-hoc
  SVG icons for things Lucide covers. Icons must stay legible from the couch: size them and
  pick their stroke width for distance, and color them through the theme tokens like any
  other element. Controller and keyboard button glyphs are a separate concern, not Lucide.
- **Motion supports navigation**, it doesn't decorate it: short, smooth, and respectful of
  reduced-motion preferences.
- Specific fonts, colors, sizes and effects are defined in `DESIGN.md` and the tokens, and may
  change. Follow whatever they currently say rather than memorizing values.

## 6. Text and languages

- No hard-coded user-facing text: every visible string goes through the i18n system.
- The app supports English (default) and Spanish; every new string is added to both.
- Copy is short and fits at TV sizes in every supported language.
- Data from the user's library (game titles, console names) is not translated.

## 7. Code boundaries

- Features are independent and do not import from each other. Shared logic, UI and types live
  in shared locations.
- The UI never touches system or Electron APIs directly; it goes through the typed bridge
  exposed by the preload.
- Components follow the `component-structure` skill.
- Everything in the repository is in English.

## 8. Before calling UI work done

- [ ] Fully usable with gamepad, keyboard and mouse.
- [ ] One clear focused element; focus is restored after dialogs and navigation.
- [ ] Readable and usable from a distance on a big screen.
- [ ] The user can tell where they are and what actions are available.
- [ ] No hard-coded design values or user-facing strings; new strings exist in every language.
- [ ] It meets the `a11y` checklist.
- [ ] It feels like a console, not a website or a streaming app.
