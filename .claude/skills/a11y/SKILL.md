---
name: a11y
description: Accessibility rules for building Ilnamiki's UI, based on WCAG 2.2 level AA, the W3C rules of ARIA use and the WAI-ARIA Authoring Practices — semantic HTML first, minimal and correct ARIA ("no ARIA is better than bad ARIA"), accessible names, focus management with gamepad, keyboard and mouse, contrast for text and non-text elements, motion, language and accessible copy through i18n. Use whenever creating or changing any component, screen or interaction the user sees or operates.
---

# Accessibility (a11y)

Every component the user sees or operates is accessible from its first version.
Accessibility is not a later pass: it is part of building the component.

**Standard:** [WCAG 2.2](https://www.w3.org/TR/WCAG22/), level **AA**, plus the
[rules of ARIA use](https://www.w3.org/TR/using-aria/) and the
[ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/) for widget
patterns. When this skill and the standard disagree, the standard wins; tell the user.

**Guiding principle: no ARIA is better than bad ARIA.** Incorrect ARIA overrides what the
browser already gets right and actively misleads assistive technology. Add ARIA only when
native HTML cannot express what you need, and then follow the APG pattern exactly.

Related skills: `ilnamiki-ui` (product and input rules), `react-testing` (tests read state
through the same semantics), `a11y-review` (auditing).

## 1. Semantics first

- Use the native element for the job: `<button>` for actions, `<a href>` for navigation to a
  location, `<nav>`, `<main>`, `<header>`, `<section>` with a heading, `<h1>`–`<h6>`, `<ul>`/`<li>`
  for lists, `<time>` for times, `<dialog>` for dialogs, `<input>`/`<label>` for forms.
- Never make a `<div>` or `<span>` clickable. If it is interactive, it is a native control.
- Headings describe the structure: one main heading per screen, no skipped levels for styling.
  Pick the level for meaning and style it with CSS.
- Use landmarks (`header`, `nav`, `main`, `footer`) once per role per screen, labelled only
  when there are several of the same kind.

## 2. ARIA: only when needed, always correct

Follow the five rules of ARIA use:

1. If a native element or attribute exists, use it instead of ARIA.
2. Do not change native semantics (no `role="button"` on a `<button>`, no `role="heading"`
   on an `<h2>`, no `role="link"` on a button).
3. Every interactive ARIA control must be operable with the keyboard (and here, the gamepad).
4. Never put `role="presentation"` or `aria-hidden="true"` on a focusable element.
5. Every interactive element has an accessible name.

Also:

- **Use a pattern completely or not at all.** A `role="tablist"` requires `role="tab"`
  children with `aria-selected`, `aria-controls` to `role="tabpanel"`, and the APG keyboard
  model. Half a pattern is bad ARIA.
- **Pick the pattern for what the element does,** not what it looks like. Top-level
  navigation between screens is a `<nav>` whose current item has `aria-current="page"`, not
  a tablist, even if it looks like tabs. Tabs are for switching panels within one screen.
- **States must match reality** and update with it: `aria-selected`, `aria-current`,
  `aria-pressed`, `aria-expanded`, `aria-disabled`, `aria-checked`. Use the one that belongs
  to the role; never combine states that contradict each other.
- **Do not repeat what is already there.** No `aria-label` that duplicates the visible text;
  no `role` that equals the implicit role; no `aria-label` on elements that cannot be named
  (plain `div`/`span`/`p` without a role).
- `aria-label` overrides visible text. If an element has visible text, that text is its name;
  if extra context is needed, use `aria-describedby` instead.
- Live regions (`aria-live`, `role="status"`, `role="alert"`) only for messages that appear
  without moving focus (toasts, scan progress). Use `polite` unless it is an error that needs
  immediate attention.

## 3. Names, descriptions and alternatives

- Every control has an accessible name that matches what a sighted user would call it
  (WCAG 2.5.3 Label in Name: the visible text is contained in the name).
- Icon-only controls get a name through `aria-label` (translated through i18n).
- Decorative icons and images get `aria-hidden="true"` (SVG) or `alt=""` (`<img>`).
- Meaningful icons that convey information without text (e.g. a real battery level, Wi-Fi
  state) need a text alternative: visually hidden text or a name on the containing element.
- Images with content (game covers, console renders) get `alt` with the game or console
  name.
- Every accessible name, description and alternative text is user-facing copy: it goes
  through i18n like any other string.

## 4. Focus and operation

The app is operated with gamepad, keyboard and mouse (see `ilnamiki-ui`). For accessibility:

- **The visual focus is the real focus.** The element that looks focused holds DOM focus
  (`element.focus()`), so screen readers announce it. Do not fake focus with a CSS class
  alone. Use roving `tabIndex` (`0` on the active item, `-1` on the rest) inside composite
  widgets.
- **Focus is always visible** (2.4.7) and never hidden behind other content (2.4.11). The
  focus indicator has at least 3:1 contrast against what surrounds it (1.4.11).
- **Logical focus order** that follows the visual order (2.4.3).
- **No traps** (2.1.2): `back` always leaves dialogs and overlays, and focus returns to the
  element that opened them.
- **When content changes, focus moves on purpose:** to the new screen's main heading or first
  control on navigation, to the dialog when it opens, back to the trigger when it closes.
- **Targets are large enough** (2.5.8: at least 24×24 CSS px; in a 10-foot UI aim much
  larger). Mouse users must be able to hit every control.
- **Disabled controls** stay discoverable: prefer `aria-disabled="true"` with blocked actions
  over removing them from the focus order when the user needs to know they exist.

## 5. Contrast and color

Measure contrast with the WCAG relative-luminance formula against the actual background,
including gradients (check the lightest and darkest point behind the text) and translucent
surfaces (check the composed color).

| What | Minimum (AA) |
|---|---|
| Body and label text | 4.5:1 |
| Large text (≥ 24px regular or ≥ 18.66px bold) | 3:1 |
| Icons, control borders, focus indicators, meaningful graphics (1.4.11) | 3:1 |
| Disabled controls and pure decoration | no requirement |

- **Never use color alone** to convey meaning (1.4.1): selection, errors and status also
  change shape, text, an icon or a semantic state.
- Text over artwork or video gets a scrim or surface so contrast holds for any image.
- New color tokens are checked against the surfaces they will be used on before they are
  added to `DESIGN.md`.

## 6. Motion, timing and audio

- Respect `prefers-reduced-motion`: no essential information depends on animation, and
  motion tokens already drop to 0.
- Nothing flashes more than three times per second (2.3.1).
- Automatic changes (dwell previews, carousels, background video) must not move focus or
  replace content the user is reading. Anything that auto-plays for more than 5 seconds can
  be paused or stopped (2.2.2).
- Sound effects never carry information that is not also shown on screen.

## 7. Language and text

- The document language (`<html lang>`) matches the active i18n language and updates when it
  changes (3.1.1).
- Text can be resized and stays readable; do not lock text into fixed-height boxes that clip
  it, especially with Spanish being longer than English.
- Error and status messages explain what happened and what to do next in plain language.

## 8. Checklist

Before considering a component done:

- [ ] Native elements are used wherever they exist; no clickable `div`/`span`.
- [ ] Every ARIA attribute is necessary, belongs to the role, and reflects the real state.
- [ ] Every control has an accessible name matching its visible label; icon-only controls
      are named through i18n; decorative icons are hidden.
- [ ] The visually focused element holds DOM focus; focus is visible, ordered and restored.
- [ ] Text meets 4.5:1 (3:1 if large); icons, borders and focus indicators meet 3:1.
- [ ] Nothing relies on color alone.
- [ ] Motion respects reduced-motion; no auto-changing content steals focus.
- [ ] Tests read state through semantics (roles, names, `aria-*`), per `react-testing`.
