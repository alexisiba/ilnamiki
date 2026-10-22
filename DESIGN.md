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
- **Overscan Margins:** 64px (`4rem` / 6%) outer margins on all sides. Interactive content never enters this perimeter to prevent clipping on diverse consumer display panels.
- **Grid Architecture:** A dynamic horizontal-rail layout. Primary content uses a 12-column grid structure with 32px (`2rem`) gutters, but primary navigation occurs across continuous horizontal scroll channels (shelves) that preserve visual alignment on the Y-axis.
- **Rhythm & Safe Areas:** The screen is divided vertically into 3 distinct functional zones:
  1. Top Command Bar (Height: 96px): Clock, network status, active profile, global controller prompts.
  2. Hero Stage & Active Shelves (Height: 840px): Game cover flow, dynamic metadata panel, active launch rail.
  3. Bottom Key Legend (Height: 80px): Dynamic controller action mapping (A: Launch, X: Options, Y: Filter, B: Back).

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
- **Focused State:** Scales to `1.05x`, z-index elevated to 10. Border swaps to 2px solid `#00D2FF`. Halo: `0 0 28px rgba(0, 210, 255, 0.5)`. Text badge transforms from `#94A3B8` to `#FFFFFF`.
- **Badge Overlay:** System/core tag (e.g., "PS2", "SNES") pinned to top-right using secondary accent `#A855F7` at 20% background with 1px solid border.

### Controller Action Buttons
- High-visibility tactile chips anchored along the footer bar.
- Uses circular SVG controller face-button icons (A, B, X, Y, D-pad, RT/LT) rendered at 36px diameter.
- Accompanying action labels in `JetBrains Mono` 20px (`label-md`), tracking at +0.08em in `#94A3B8`.

### System Navigation Rails (Horizontal Carousel)
- Content snaps to viewport center on X-axis navigation.
- Smooth hardware-accelerated translation with snappy dampening.
- Out-of-focus cards smoothly transition their imagery to the Dimming Filter (text keeps its contrast tokens) with border radiance disabled.

### Metric Chips & Status Badges
- Rendered with background `#121624` (85% opacity) and 1px border.
- Active states (e.g., "ONLINE", "60 FPS", "CORE LOADED") display a 8px pulsing dot in `#00FFA3` accompanied by monospace text.

### Dialog Modals & Configuration Sheets
- Centered 960px fixed-width dialog, `#121624` background with 40px backdrop blur and 20px border radius.
- Encircled by a quiet 1px border (`#00D2FF` at 30% opacity).
- Primary confirmation actions are illuminated in full `#00D2FF` fill with black text (`#0B0D14`) for instantaneous contrast recognition.