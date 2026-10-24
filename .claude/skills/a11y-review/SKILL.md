---
name: a11y-review
description: Procedure for auditing accessibility in Ilnamiki against WCAG 2.2 AA and the rules of ARIA use — checks semantics, unnecessary, redundant or contradictory ARIA ("no ARIA is better than bad ARIA"), accessible names, focus and input operation, contrast computed from the design tokens, motion, language and i18n of accessible text, and reports findings with severity, WCAG reference and fix. Use when asked to review, audit or check accessibility of a component, screen, diff or the whole renderer, and before merging UI changes.
---

# Accessibility Review

How to audit Ilnamiki's UI for accessibility. The rules being checked live in the `a11y`
skill; this skill is the procedure and the report format. Read `a11y` first.

**Review mindset:** removing bad ARIA is as valuable as adding missing semantics. An element
with no ARIA and correct native HTML is better than one with ARIA that is redundant, wrong or
out of sync with reality.

## 1. Scope

1. Determine what is under review: the files the user named, the current diff, or the whole
   renderer (`src/renderer/src`).
2. For each component in scope, read its markup, its styles (for contrast and focus) and the
   tokens it uses in `theme/variables.css`.
3. Do not change code during the review unless the user asks. Report first.

## 2. Passes

Run every pass on every component in scope.

### Pass 1: Semantics

- Interactive elements are native (`button`, `a`, form controls). Flag any clickable
  `div`/`span` or `onClick` on non-interactive elements.
- Headings form a logical outline per screen; levels are not chosen for size.
- Landmarks exist and are not duplicated without labels.
- Lists, times, dialogs and forms use their native elements.

### Pass 2: ARIA audit

For **every** `role` and `aria-*` attribute found, answer:

1. **Is it necessary?** Would native HTML already provide it? If yes → remove.
2. **Is it redundant?** Implicit role repeated (`role="button"` on `<button>`,
   `role="navigation"` on `<nav>`), or `aria-label` equal to the visible text → remove.
3. **Is it valid for this element?** The attribute is allowed on the role; `aria-label` is
   not on a non-nameable element (plain `div`, `span`, `p`); `aria-hidden` is not on a
   focusable element or an ancestor of one.
4. **Is the pattern complete?** If a composite role is used (`tablist`, `listbox`, `menu`,
   `grid`, `dialog`), every required child role, state, relationship and keyboard behavior
   from the APG pattern is present. Otherwise → finish the pattern or remove it.
5. **Is it the right pattern?** Screen navigation uses `nav` + `aria-current`, not tabs;
   tabs switch panels; menus are not used for plain lists of links or buttons.
6. **Does the state match reality?** `aria-selected`, `aria-current`, `aria-pressed`,
   `aria-expanded`, `aria-checked`, `aria-disabled` update with the UI state and match what
   is shown. No contradictory combinations (e.g. `aria-selected` and `aria-pressed` on the
   same element, `aria-disabled` on an element that still acts).
7. **Does `aria-label` hide visible text?** If the element has visible text, the name should
   come from it; extra context belongs in `aria-describedby`.

### Pass 3: Names and alternatives

- Every interactive element has an accessible name, and the visible label is contained in it
  (2.5.3).
- Icon-only controls are named; decorative icons are `aria-hidden`; meaningful icons have a
  text alternative.
- Images have appropriate `alt` (empty for decoration).
- Every name, description and alternative goes through i18n and exists in every language.

### Pass 4: Focus and operation

- The visually focused element holds DOM focus (no CSS-only focus); roving `tabIndex` in
  composite widgets.
- Every action is reachable with gamepad, keyboard and mouse.
- Focus is visible (2.4.7), not obscured (2.4.11), in logical order (2.4.3), and restored
  after dialogs and navigation. No traps (2.1.2).
- Targets are at least 24×24 CSS px (2.5.8).

### Pass 5: Contrast and color

Compute, do not eyeball. Resolve each color from the tokens and calculate the ratio with the
WCAG formula:

```
L = 0.2126 R + 0.7152 G + 0.0722 B   (each channel linearized:
    c ≤ 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ^ 2.4, with c = channel / 255)
ratio = (L_lighter + 0.05) / (L_darker + 0.05)
```

- Translucent colors: compose them over the actual background first.
- Gradients: check text against the lightest and the darkest point behind it.
- Thresholds: 4.5:1 text, 3:1 large text (≥ 24px regular or ≥ 18.66px bold), 3:1 for icons,
  control boundaries, focus indicators and meaningful graphics.
- Flag any meaning carried by color alone (1.4.1).

Report the pair, the computed ratio and the threshold, e.g.
`--color-text-muted on --color-surface-high: 6.12:1 (≥ 4.5:1) ✓`.

### Pass 6: Motion, timing and language

- Reduced motion is respected; no flashing above three per second.
- Auto-changing content does not move focus or replace what the user is reading; long
  auto-play can be paused.
- `<html lang>` follows the active i18n language.

### Pass 7: Tests

- Tests query by role and accessible name and read state from `aria-*`, per `react-testing`.
- Flag tests that rely on class names to assert state that should be semantic.

## 3. Report

Group findings by severity. Each finding includes the location, the problem, the WCAG
criterion or ARIA rule, and the concrete fix (which may be a removal).

| Severity | Meaning |
|---|---|
| **Blocker** | Prevents use: unreachable action, missing name on a control, focus trap, contrast far below threshold, ARIA that announces the wrong thing |
| **Major** | Causes confusion or fails AA: wrong pattern, out-of-sync state, contrast slightly below threshold, CSS-only focus |
| **Minor** | Redundant or unnecessary ARIA, small semantic improvements, best practice beyond AA |

```
### Major
- `components/TopBar/components/TopBarTab.tsx:6` — Active tab is shown only with a CSS
  class; assistive tech cannot tell which screen is current. (WCAG 4.1.2)
  Fix: add `aria-current="page"` to the active item.

### Minor
- `features/x/Card.tsx:12` — `aria-label="Play"` repeats the visible text "Play".
  (ARIA: redundant name) Fix: remove the attribute.
```

End the report with:

- **Passed checks** (briefly, so the user knows what was verified, including computed
  contrast ratios).
- **Not verified** (anything that needs a running app or a screen reader to confirm).
- A recommendation of what to fix first.
