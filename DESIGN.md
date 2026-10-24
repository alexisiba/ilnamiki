---
name: Obsidian Cyberpunk 10-Foot Interface
colors:
  surface: '#11131a'
  surface-dim: '#11131a'
  surface-bright: '#353948'
  surface-container-lowest: '#07090e'
  surface-container-low: '#0f1321'
  surface-container: '#121624'
  surface-container-high: '#1b1f2d'
  surface-container-highest: '#252938'
  on-surface: '#e2e2ec'
  on-surface-variant: '#94a3b8'
  inverse-surface: '#e2e2ec'
  inverse-on-surface: '#2c303f'
  outline: '#8d90a2'
  outline-variant: '#424656'
  surface-tint: '#00d2ff'
  primary: '#00d2ff'
  on-primary: '#0b0d14'
  primary-container: '#004e60'
  on-primary-container: '#b6ebff'
  inverse-primary: '#00677f'
  secondary: '#a855f7'
  on-secondary: '#0b0d14'
  secondary-container: '#6900b3'
  on-secondary-container: '#f0dbff'
  tertiary: '#00ffa3'
  on-tertiary: '#0b0d14'
  tertiary-container: '#005231'
  on-tertiary-container: '#52ffac'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  success: '#00e290'
  on-success: '#003920'
  success-container: '#005231'
  on-success-container: '#52ffac'
  warning: '#ffba4b'
  on-warning: '#442b00'
  warning-container: '#624000'
  on-warning-container: '#ffddb1'
  info: '#a1c9ff'
  on-info: '#00325b'
  info-container: '#004880'
  on-info-container: '#d3e4ff'
  primary-fixed: '#b6ebff'
  primary-fixed-dim: '#47d6ff'
  on-primary-fixed: '#001f28'
  on-primary-fixed-variant: '#004e60'
  secondary-fixed: '#f0dbff'
  secondary-fixed-dim: '#ddb7ff'
  on-secondary-fixed: '#2c0051'
  on-secondary-fixed-variant: '#6900b3'
  tertiary-fixed: '#52ffac'
  tertiary-fixed-dim: '#00e290'
  on-tertiary-fixed: '#002111'
  on-tertiary-fixed-variant: '#005231'
  background: '#11131a'
  on-background: '#e2e2ec'
  surface-variant: '#252938'
typography:
  headline-xl:
    fontFamily: Outfit
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 80px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Outfit
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: 0.05em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: 0.08em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 2rem
  margin: 4rem
  space-xs: 0.5rem
  space-sm: 1rem
  space-md: 1.5rem
  space-lg: 2rem
  space-xl: 3rem
  space-2xl: 4rem
  space-3xl: 5rem
---

## Brand & Style

The design system is engineered specifically for a premium living room console experience viewed from an average distance of 3 meters (10-foot UI). It rejects standard web metaphors, media streaming service patterns, and casual desktop conventions in favor of a bespoke, native video game operating environment. The experience projects low-latency authority, precision engineering, and refined cyberpunk minimalism—eschewing chaotic visual noise for deep obsidian negative space, hyper-tactile focus mechanics, and razor-sharp geometric instrumentation.

Targeted at discerning emulation enthusiasts and hardware collectors, the system evokes the quiet tension of high-performance gaming hardware running in an idle state. Navigating the UI feels physical and directional, driven strictly by controller input (D-pad/analog stick navigation) rather than cursor hovering. Every transition, border glow, and focus movement affirms absolute user agency through crisp visual feedback, high luminescence contrasts, and spatial consistency.

## Colors

The palette is anchored in an uncompromising deep obsidian navy base (`#11131A`), engineered to blend seamlessly into OLED bezels and dark living room surroundings. Pure white (`#FFFFFF`) is reserved strictly for focused text, high-priority system glyphs, and primary actionable identifiers.

- **Primary Accent (`#00D2FF` - Electric Cyan):** The primary navigational axis and focal point. Used exclusively for controller focus targets, active indicator pills, primary confirmation strokes, and electric halos. Unfocused states should avoid pure cyan to maintain absolute navigational clarity.
- **Secondary Accent (`#A855F7` - Neon Purple):** Structural categorization, secondary platform badges, metadata highlights, and ambient glow accents on game artwork.
- **Tertiary Accent (`#00FFA3` - Neon Mint):** Hardware health, emulator FPS counters, memory card write status, latency telemetry, and online multiplayer indicators.
- **Surface Foundations (`#121624`):** Modulated at 60%–85% opacities over game key art backdrops with hardware-accelerated blur (24px–40px), framed by 1px sub-surface borders using 10%–20% white or electric cyan.
- **Text Contrast System:** High-visibility White (`#FFFFFF`) at 100% luminance for focused items; Slate Muted (`#94A3B8`) for contextual secondary labels; Slate Dim (`#6B7A90`) for unfocused metadata (minimum ~4:1 contrast against both the canvas and glass surfaces so it stays readable at 3 meters).
- **Status Signals:** Semantic feedback colors for toasts, banners, inline messages and status pills. Each follows the same tonal pattern as `error`: the base tone for text and icons on dark surfaces, `*-container` as the tinted background, and `on-*` / `on-*-container` for content placed on top.
  - **Success (`#00FFA3` seed - Neon Mint):** Library scan completed, settings saved, ROM verified. Shares the tertiary hue so success always reads as the system's "healthy" signal.
  - **Warning (`#FFB020` seed - Amber Signal):** Unrecognized ROMs, missing artwork, low controller battery, outdated emulators. Needs attention but does not block play.
  - **Info (`#3B9EFF` seed - Azure Beacon):** Tips, first-run guidance, update available, background tasks in progress. Deliberately a deeper blue than Electric Cyan so informational messages are never mistaken for focus or primary actions.
  - **Error:** Blocking failures — missing BIOS, emulator crash, controller disconnected — use the `error` tokens.

## Typography

Typography is governed by 10-foot legibility dynamics. Standard web font scales fail at 3 meters; therefore, the absolute floor for continuous body text is set to 24px, with secondary telemetry labels scaling no lower than 16px in all-caps monospace.

The system uses three typefaces, each with a single responsibility:
- **Outfit (Headlines):** Geometric, balanced and confident. Carries screen titles, console names and game titles. Bold weights (600–700) and tightened tracking (-0.01em to -0.03em) keep large titles punchy at distance.
- **Plus Jakarta Sans (Body):** Warm, highly legible sans-serif for continuous reading: game and console descriptions, settings explanations and dialog copy.
- **JetBrains Mono (Labels & Telemetry):** The telemetry layer, delivering unyielding clarity for FPS metrics, save states, resolution markers (e.g., `4K@60FPS`), ROM file hashes, and controller button prompts. Programming ligatures must be disabled (`font-variant-ligatures: none`) so labels render literally.

All uppercase labels require expanded letter tracking (+0.05em to +0.1em) to combat distance optical bleed.

## Layout & Spacing

The layout is locked to a strict 1920x1080 fixed-frame standard, utilizing a TV-safe canvas boundary:
- **Overscan Margins:** 64px (`4rem` / 6%) outer margins on the left, right and bottom, and a reduced 32px (`2rem`) margin at the top so the Top Command Bar sits closer to the edge. Interactive content never enters this perimeter to prevent clipping on diverse consumer display panels.
- **Grid Architecture:** A dynamic horizontal-rail layout. Primary content uses a 12-column grid structure with 32px (`2rem`) gutters, but primary navigation occurs across continuous horizontal scroll channels (shelves) that preserve visual alignment on the Y-axis.
- **Rhythm & Safe Areas:** The screen is divided vertically into 3 distinct functional zones:
  1. Top Command Bar (Height: 96px): Clock, network status, active profile, global controller prompts.
  2. Hero Stage & Active Shelves (Height: 840px): Game cover flow, dynamic metadata panel, active launch rail.
  3. Bottom Key Legend (Height: 80px): Dynamic controller action mapping (A: Launch, X: Options, Y: Filter, B: Back).
- **Ultrawide Displays:** Screens whose content spans the width (console games, game details) are centered and capped at 2400px (`--layout-content-max-width`), so they do not stretch beyond a 16:9 composition. At 1920px the cap has no effect.

## Elevation & Depth

Elevation is rendered through luminous radiance, spatial transformation, and layered translucency rather than soft drop shadows:

1. **Resting Layer (Surface 0):** Background plate `#11131A` with a subtle, dynamic 80px radial gradient behind the active game hero artwork, tinted at 15% opacity with the active game's dominant palette.
2. **Sub-Surface (Surface 1):** Translucent frosted glass containers (`#121624` at 65% alpha with 32px backdrop-filter blur). Edges are defined by a crisp 1px stroke (`#FFFFFF` at 10% opacity).
3. **Elevated Layer (Surface 2 - Active Selection):** The focused element instantly scales to `1.05x` with an accelerated cubic-bezier curve (`cubic-bezier(0.16, 1, 0.3, 1)` over 180ms). The border stroke snaps to `#00D2FF` at 100% opacity, casting an electric cyan halo: `box-shadow: 0 0 0 2px #00D2FF, 0 0 30px rgba(0, 210, 255, 0.45)`.
4. **Dimming Filter:** Any item sharing a horizontal or vertical container with the active item that does not currently possess focus has its **imagery** (box art, console renders, screenshots) muted to 60% (`filter: brightness(0.6) saturate(0.8)`), amplifying the focal depth and eliminating peripheral distraction. The dimming filter is applied to the image layer only — never to a container that holds text. Text in unfocused items is de-emphasized exclusively through the Text Contrast System colors (Slate Muted / Slate Dim), so it never drops below its minimum contrast.

## Shapes

The interface balances sharp technological edges with modern living-room ergonomics. Corner radii follow a strict scale:
- Small controls, tags, and controller badge pills use 8px (`rounded-md`).
- Primary game cards, menu trays, and system dialogue modules use 16px to 20px (`rounded-lg` to `rounded-xl`).
- Focus rings conform exactly to the perimeter of their host shape, preserving geometric parallelism during the 1.05x scale transform.

## Components

### Game Cover Cards
- **Dimensions:** 260px × 360px (Vertical box-art) or 480px × 270px (Horizontal 16:9 banner).
- **Idle State:** Surface `#121624` with 15% border (`#FFFFFF`), cover artwork dimmed by the Dimming Filter when a sibling holds focus (full brightness when nothing in its container is focused), 16px corner radius.
- **Focused State:** Scales to `1.05x`, z-index elevated to 10. Border swaps to 2px solid `#00D2FF`. Halo: `0 0 20px rgba(0, 210, 255, 0.5)`, softer than other focus targets so the scaled card's glow fits inside its row's focus bleed. Text badge transforms from `#94A3B8` to `#FFFFFF`.
- **Badge Overlay:** System/core tag (e.g., "PS2", "SNES") pinned to top-right using secondary accent `#A855F7` at 20% background with 1px solid border.

### Controller Action Buttons
- High-visibility tactile chips anchored along the footer bar.
- Uses circular SVG controller face-button icons (A, B, X, Y, D-pad, RT/LT) rendered at 36px diameter.
- Accompanying action labels in `JetBrains Mono` 20px (`label-md`), tracking at +0.08em in `#94A3B8`.
- The footer shows only the actions the current screen has on, in a fixed order: navigate, select, back, the screen's contextual actions (X, Y, LT, RT, each with its own label) and switching tabs. An action turned off on a screen loses its chip, and its top-bar shoulder button is left out.

### System Navigation Rails (Horizontal Carousel)
- Content snaps to viewport center on X-axis navigation.
- Smooth hardware-accelerated translation with snappy dampening.
- Out-of-focus cards smoothly transition their imagery to the Dimming Filter (text keeps its contrast tokens) with border radiance disabled.

### Console Carousel (Library)
- First step of the library: one console at a time, centered, with its neighbors set back behind it. Stops at both ends; it never wraps.
- **Selected console:** hardware render fitted into an 800px-wide 16:9 frame (any proportion, never cropped) at full brightness, its name below in `headline-xl` `#FFFFFF`. Taking the center at full size is its focus indicator; no ring is drawn around a render.
- **Neighbors:** 640px from the center, scaled to `0.6x`, render at 35% opacity plus the Dimming Filter, name in Slate Dim (`#6B7A90`) faded to the same 35%. This name deliberately falls below AA contrast so it never competes with the selection; it stays available to screen readers and becomes the full-contrast title once selected. Only the render and name show; consoles further away are hidden.
- **Details:** below the name, maker and release year as an uppercase `label-md` line in Slate Muted, then a games-installed status pill (see Metric Chips) with an 8px success dot and its glow (`rgba(0, 226, 144, 0.45)`).
- **Position indicator** (shared by every carousel): below 15 items, 8px Slate Dim circles where the selected one stretches into a 32px rounded line in `#00D2FF` with its cyan glow (shape, not only color, marks the selection); from 15 items, the position as `x / y` in `label-sm` Slate Muted, since dots do not scale to large lists.
- **Backdrop:** the canvas keeps its base color, with a soft circular white light (`#FFFFFF` at 14%) behind the selected console that fully fades before the stage edges.
- **Motion:** consoles slide over 320ms on the focus curve; pointer hover never moves the carousel, a click selects. Reduced motion drops the slide to 0ms.

### Console Games (Library)
- Opened by confirming a console in the Console Carousel. The console name is the screen title in `headline-xl`, with games installed and release year below as an uppercase `label-md` line in Slate Muted. No console render.
- **Two columns.** Left (2/3): a game carousel built like the Console Carousel. Right (1/3): the selected game's panel. The whole screen, title included, is centered and capped at 2400px so it does not stretch on ultrawide displays.
- **Game frames:** fixed 440×330px frame in the lowest surface (`#07090E`), 24px padding, 12px radius; the artwork fills the inner area (cropped to fit) with 4px corners. The selected frame has a 2px `#00D2FF` border and the cyan glow (`0 0 30px rgba(0, 210, 255, 0.45)`); neighbors are 320px from the center, scaled to `0.6x` and faded to 35% with the Dimming Filter on their artwork, clipped at the column edge.
- **Below the frame:** the game title in `headline-sm`, then year, genre and players as an uppercase `label-md` line, then the carousel's position indicator.
- **Panel:** `#1B1F2D` with a 1px border and 16px radius, holding the description, two stat cards on `#252938` with 12px radius (playtime and last played: uppercase `label-sm` label with an icon, `headline-sm` value) and a full-width Play now button.
- **Input:** focus stays on Play now; left/right switch games without moving it, a click on a neighbor selects it, and the selection change is announced to screen readers.

### Search
- Opens over any screen with the search action. There is no dialog box: the whole app blurs behind it (`#121624` at 65% with 40px backdrop blur) and fades in over 180ms.
- **Field:** a 48px Slate Muted search icon and the text in `headline-lg` `#FFFFFF` with a cyan caret, over a 2px underline that turns `#00D2FF` while focused (the focus indicator). Placeholder in Slate Dim. 960px wide at most, near the top of the screen to leave room for results.
- Modal: the screen behind is inert and gets no input; back closes search and returns focus where it was.
- The on-screen keyboard is docked at the bottom, leaving the room between it and the field for results.
- **Results:** submitting (Enter in the field, the action key or Start) searches game titles only, never consoles, ignoring case and accents, and shows the first 20 matches in library order. When some match, the keyboard gives way to the game carousel (the same as Console Games, without the details panel) and focus moves to the first game; the focused game is the selected one, left/right move through them and confirming one closes search and opens its details. Up returns to the field, and confirming the field (or typing in it) hides the results and brings the keyboard back. When none match, a Slate Muted `body-lg` message replaces the results and the keyboard stays. An empty search does nothing.

### On-Screen Keyboard
- QWERTY in ten columns of 88×72px keys with 8px gaps, so it matches the 960px panel width: digits, `qwertyuiop`, `asdfghjklñ`, `zxcvbnm-` and Delete (2 columns), then Caps Lock (2), Space (5) and the action key (3), e.g. Search.
- Keys on the strong glass surface (`#121624` at 85%) with a 1px strong border and 12px radius, characters in `headline-sm`. The focused key gets a `#00D2FF` border, white text and the cyan glow; it fills with `#00D2FF` (black text) exactly while its button, key or the pointer is held down, however short the press, with no animation. At rest the action key looks like any other key. Caps Lock (⇪ icon) is outlined and labelled in `#00D2FF` while it is on (no glow), and letters show in uppercase.
- **Shortcut glyphs:** the four keys with a gamepad button of their own show that button's glyph (26px, the device's own symbols) in their top-right corner: Delete X, Space Y, Caps Lock LB, action key Start. Hidden while the keyboard is the active device.
- **Button guide:** search shows the guide over the blur with only its general actions (navigate, select, close); the keyboard shortcuts live on their keys.
- **Gamepad:** directions move between the field and the keys, A presses the focused key, X deletes a character, Y types a space, LB toggles Caps Lock and Start submits, pressing the action key without moving focus. These keys show pressed too while their button is held. Only deleting repeats while held (X, or A on the Delete key), one character at a time with the direction repeat timing; every other key acts once per press. B closes the dialog, which opens empty again.
- **Physical keyboard:** a physical key shows its on-screen key pressed exactly while it is held (letters in either case, digits, `ñ`, `-`, Space, Backspace as Delete and Caps Lock), several at once. It types wherever focus is: in the field by itself, and on the keys too, where character keys and Space type instead of acting and Backspace deletes, without moving focus. Arrows, Enter and Escape keep their actions, so Enter presses the focused key and only lights the action key from the field. The physical Caps Lock also toggles the on-screen one.

### Metric Chips & Status Badges
- Rendered with background `#121624` (85% opacity) and 1px border.
- Active states (e.g., "ONLINE", "60 FPS", "CORE LOADED") display a 8px pulsing dot in `#00FFA3` accompanied by monospace text.

### Dialog Modals & Configuration Sheets
- Centered 960px fixed-width dialog, `#121624` background with 40px backdrop blur and 20px border radius.
- Encircled by a quiet 1px border (`#00D2FF` at 30% opacity).
- Primary confirmation actions are illuminated in full `#00D2FF` fill with black text (`#0B0D14`) for instantaneous contrast recognition.