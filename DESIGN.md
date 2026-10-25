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

> **Authorship:** the first version of this design system was generated with
> [Stitch](https://stitch.withgoogle.com/) by Google. It has since been adapted and extended
> for Ilnamiki as the app is built.

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

### System Status (Top Command Bar)
- The right side of the Top Command Bar, in order: network, controller and clock, 24px apart. Status icons are Lucide icons at 28px with a 2.25 stroke in Slate Muted (`#94A3B8`); the clock is `label-lg` in `#E2E2EC`.
- Each icon reflects what the system reports and has a translated accessible name. When the system doesn't say, the icon is left out rather than guessed.
- **Network:** how the computer reaches the network, refreshed every 10 seconds and whenever the network changes.
  - Wi-Fi by signal strength: 76–100% `wifi`, 51–75% `wifi-high`, 26–50% `wifi-low`, 1–25% `wifi-zero`; `wifi` alone when the signal is unknown.
  - Wi-Fi with no signal (0%) or without internet (captive portal, limited or no connectivity): `wifi-off`.
  - Ethernet: `ethernet-port`. Without internet, the port turns Slate Dim (`#6B7A90`) as if switched off, with a 20px `circle-alert` in Warning (`#FFBA4B`) next to it, so the state never depends on color alone.
  - Offline (no network at all): `globe-off`.
  - When the system can't tell whether the internet is reachable, the connection icon shows as connected.
- **Controller:** shown only while a gamepad is connected: `gamepad-2` followed, 8px apart, by how it is powered, refreshed every minute and whenever a controller connects or disconnects.
  - By cable (USB): `usb`, drawn at 20px because its glyph fills more of its box than the other icons.
  - By Bluetooth, by battery level: 71–100% `battery-full`, 41–70% `battery-medium`, 11–40% `battery-low`, 0–10% `battery-warning` in Warning (`#FFBA4B`).
  - Nothing next to the gamepad when the battery isn't reported. With several controllers, the first one is shown.

### System Navigation Rails (Horizontal Carousel)
- Content snaps to viewport center on X-axis navigation.
- Smooth hardware-accelerated translation with snappy dampening.
- Out-of-focus cards smoothly transition their imagery to the Dimming Filter (text keeps its contrast tokens) with border radiance disabled.

### Home First Run
- Until the user can play, Home shows one setup panel, centered, checking in order: an emulator, then a platform it plays, then a folder with games. Each panel shares one layout: a large cyan icon with a soft glow, the title, a Slate Muted `body-lg` description and one button, focused, that opens Settings on the category that solves it. Until what a check needs is read nothing shows, so no panel flashes.
- **No emulator** (gamepad icon): `Set up your first emulator`, recommending RetroArch; Set up an emulator opens Settings › Emulators.
- **No platform** (joystick icon): `Your emulator has no consoles yet`, setting it up (in RetroArch, installing cores); Go to emulator settings opens Settings › Emulators.
- **No games** (folder-plus icon): `Add your games`, `Your emulator is ready. Add a folder with your games to start playing.`, then the emulators set up as a list that is information, not controls: `#1B1F2D` rows with a 1px border and 12px radius: a 28px Success `monitor-check` icon with a soft green glow on the left (the emulator is ready), then the emulator's name in `body-lg` with its version 16px apart, smaller, in Slate Muted `body-md` on the same baseline, and below it how many consoles it plays (`6 consoles linked`) as an uppercase `label-md` line in Slate Muted. Go to Settings opens Settings › Game folders.

### Console Carousel (Library)
- First step of the library: one console at a time, centered, with its neighbors set back behind it. Stops at both ends; it never wraps.
- **Which consoles:** the installed platforms whose game folder has games, by name. The app's platform catalog names them (e.g. `NES`, not what a multi-system core calls it) and gives their release year and render; a platform it doesn't know keeps what its cores say, without a year or render.
- **No render:** a 96px Slate Dim `image-off` icon (Slate Muted when selected) centered in the render's frame, so the name and details stay in place.
- **No consoles with games:** the shared empty layout, centered: a 48px Slate Muted joystick icon, `No consoles with games yet`, how to get one (adding a game folder in Settings) and an Open Settings button, focused, that switches to Settings. Until the platforms and folders are read nothing shows, so it never flashes.
- **Selected console:** hardware render fitted into an 800px-wide 16:9 frame (any proportion, never cropped) at full brightness, its name below in `headline-xl` `#FFFFFF`. Taking the center at full size is its focus indicator; no ring is drawn around a render.
- **Neighbors:** 640px from the center, scaled to `0.6x`, render at 35% opacity plus the Dimming Filter, name in Slate Dim (`#6B7A90`) faded to the same 35%. This name deliberately falls below AA contrast so it never competes with the selection; it stays available to screen readers and becomes the full-contrast title once selected. Only the render and name show; consoles further away are hidden.
- **Details:** below the name, maker and release year as an uppercase `label-md` line in Slate Muted (either left out when unknown, and the line with both), then a games-installed status pill (see Metric Chips) with an 8px success dot and its glow (`rgba(0, 226, 144, 0.45)`).
- **Position indicator** (shared by every carousel): below 15 items, 8px Slate Dim circles where the selected one stretches into a 32px rounded line in `#00D2FF` with its cyan glow (shape, not only color, marks the selection); from 15 items, the position as `x / y` in `label-sm` Slate Muted, since dots do not scale to large lists.
- **Backdrop:** the canvas keeps its base color, with a soft circular white light (`#FFFFFF` at 14%) behind the selected console that fully fades before the stage edges.
- **Motion:** consoles slide over 320ms on the focus curve; pointer hover never moves the carousel, a click selects. Reduced motion drops the slide to 0ms.

### Console Games (Library)
- Opened by confirming a console in the Console Carousel. The console name is the screen title in `headline-xl`, with games installed and release year below as an uppercase `label-md` line in Slate Muted. No console render.
- **Two columns.** Left (2/3): a game carousel built like the Console Carousel. Right (1/3): the selected game's panel. The whole screen, title included, is centered and capped at 2400px so it does not stretch on ultrawide displays.
- **Game frames:** fixed 440×330px frame in the lowest surface (`#07090E`), 24px padding, 12px radius; the artwork fills the inner area (cropped to fit) with 4px corners. The selected frame has a 2px `#00D2FF` border and the cyan glow (`0 0 30px rgba(0, 210, 255, 0.45)`); neighbors are 320px from the center, scaled to `0.6x` and faded to 35% with the Dimming Filter on their artwork, clipped at the column edge.
- **Which games:** those saved from the console's game folder, by title, titled as their file is (e.g. `Crash Bandicoot (USA)`). Until metadata exists, every game shows the generic `no-image` artwork (`assets/images/games/no-image.webp`), and any game without artwork will too.
- **Below the frame:** the game title in `headline-sm`, then year, genre and players as an uppercase `label-md` line (only those known; left out when none is), then the carousel's position indicator.
- **Panel:** `#1B1F2D` with a 1px border and 16px radius, holding the description (`No description` in Slate Muted when the game has none) and a full-width Play now button. Play stats will come back with play history.
- **Playing:** Play now starts the game in RetroArch, in full screen, with its platform's first installed core. Until RetroArch closes, the button reads `Playing` and is unavailable. RetroArch closes with Start + Select (it asks to press them again), from its menu's Quit, or by closing the game from its menu; Ilnamiki then comes back in front, as it was. When the game can't start (gone from the library, its file missing, no core, another game playing, or the emulator didn't run), why shows below Play now in Error `body-md`.
- **Loading and errors:** nothing shows until the console is known, then only its title until its games are read, so no message flashes. When the games can't be read, a Slate Muted `body-lg` line says so.
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

### Settings
- No visible title: the top bar already shows the section (the heading stays for screen readers). Two columns; unlike other screens, it spans the whole width (no 2400px cap).
- **Categories:** a narrow 320px column (`--layout-settings-nav-width`) of vertical tabs with an 8px radius, each name fitting in one or two lines (`body-lg` in Outfit). Focusing a category selects it and shows its content; the selected one keeps a `#1B1F2D` surface with a strong border and white text while focus is in its content, and the focused one fills with `#00D2FF` (black text) and the cyan glow, like a button.
- **Content panel:** the rest of the width, 16px from the categories, framed by a 1px strong border (`#FFFFFF` at 15%) with an 8px radius and a light 24px padding.
- **Input:** right enters the content, left from the left edge of the content returns to the categories, and back returns focus to the selected category.
- **Focus movement:** screens read top to bottom (forms, details screens) move by rows, as a list does: up and down go to the row above or below, to the button last focused in it (else its first, on the left), and left and right only move within a row. So no button is skipped because it sits on the other side, and every one is a direction away from its neighbors. Shelves and grids elsewhere keep moving to what is visually closest, keeping the column. Emulator Details and Game Folder Details move this way; other Settings screens may follow.
- **Screens inside Settings** (e.g. Add Emulator) take the whole width in place of the categories and their content, so focus can't reach another category while one is open; back (or the screen's Back or Cancel) is the way out, returning to the category's content with focus on what opened the screen. Above their panel, a trail says where they hang from (`Settings › Game folders`) as an uppercase `label-md` line in Slate Muted; it is plain text, not a control. The panel keeps its frame. A Back button appears only on those inner screens, never on a category's main content, where back already returns to the categories.
- **No redundant headings:** a category's content has no heading that repeats the selected category's name; only headings that add information (e.g. an empty view's title) appear.
- **Emulators:** a list of the configured emulators, with no heading, each a `#1B1F2D` row with a 1px border and 12px radius: the emulator's icon on the left in an 80px `#252938` tile (a generic Slate Muted gamepad icon when it has none), and on the right its name in `headline-sm` with its version below as an uppercase `label-md` line in Slate Muted (left out when the emulator reports none). The focused row gets the cyan border and glow. At the bottom right, an Add emulator button.
- **No emulators:** the list gives way to a message centered in their room: a 48px Slate Muted gamepad icon, `No emulators configured` in `headline-sm` and, below, how to add one in Slate Muted `body-md`. Add emulator stays. Until the emulators are read, only Add emulator shows, so this message never flashes; if they can't be read, the same layout with a warning-triangle icon says so.
- **Installed platforms:** a list of the platforms that the emulators' installed cores play, by name, with no heading (the selected category already names it), each a `#1B1F2D` row with a 1px border and 12px radius: the platform's name in `headline-sm` with its cores below (`Core:` with one, `Cores:` with several, separated by `·`), then the file extensions they play (once each, separated by `·`, left out when no core declares them), both as uppercase `label-md` lines in Slate Muted, and a switch on the right. The whole row is the switch: confirming or clicking it anywhere turns the platform on or off; every platform starts on. The focused row gets the cyan border and glow. A list taller than the panel scrolls to keep the focused row in view, all the way to its top and bottom edges on the first and last rows.
- **No platforms:** the list gives way to the same centered message as No emulators, with a 48px Slate Muted joystick icon, `No platforms installed` and how to get one (by setting up an emulator), then a Set up an emulator button that moves focus to the Emulators category, which shows its content. Until the platforms are read nothing shows, so this message never flashes; if they can't be read, the same layout with a warning-triangle icon says so.
- **Game folders:** the folders Ilnamiki finds games in, as a list with no heading, each a `#1B1F2D` row with a 1px border and 12px radius: the platform's name in `headline-sm` (its id when no installed core plays it anymore) with the number of games below as an uppercase `label-md` line in Slate Muted. A folder that is no longer on disk adds `Folder not available` in Warning `body-md` with a warning-triangle icon. The focused row gets the cyan border and glow; confirming it opens the folder's details. At the bottom right, an Add folder button.
- **No game folders:** the shared empty layout with a 48px Slate Muted folder icon and `No game folders configured`; the description depends on whether a core is installed, so nothing shows until that is known.
  - **No core installed:** it says a core is needed first and offers a centered Set up an emulator button that moves focus to the Emulators category. Add folder is left out, since no folder's games could play yet.
  - **Cores installed:** it says to add the first folder with Add folder, which stays at the bottom right as with the list.
- **Empty categories** share one layout: icon, `headline-sm` title saying what is missing, Slate Muted `body-md` description saying how to get it, and an optional action button below.
- **Switch:** an 88×48px pill track with a 36px round knob and 5px padding. Off: `#252938` track with a strong border and a Slate Muted knob on the left. On: `#00D2FF` track and a `#0B0D14` knob on the right, so the state shows by position as well as color. The knob slides over 180ms on the focus curve (instant with reduced motion).

### Settings Forms
Forms opened from a Settings category (Add emulator, Add game folder) are screens inside Settings, across the whole width, and share one layout.
- **Header:** the form's title in `headline-sm`, then a note that the form is filled with a keyboard and mouse: `body-md` in `#D3E4FF` on the Info container (`#004880`), 8px radius, with a 28px keyboard icon.
- **Fields** (up to 960px wide): an uppercase `label-md` label in Slate Muted above each field. Text fields are `#1B1F2D` with a 1px strong border and 8px radius, text in `body-lg` white with a cyan caret; the focused field gets the cyan border and glow.
- **Path field:** a text field ending with a square `folder-open` icon button, as tall as the field, that opens the system's picker and fills in the chosen path; focused, it fills with `#00D2FF` like a button. Cancelling the picker keeps the path; if the picker can't open, an Error-colored `body-md` message appears below.
- **Select:** looks like a text field, showing the chosen option in white (or a prompt in Slate Dim) and a chevron-down on the right. Confirming it opens the options over the blurred screen, in a centered 640px sheet (`#121624` at 85%, 1px strong border, 16px radius): a `headline-sm` title saying what is being chosen (the sheet hides the field's label), then `body-lg` rows; the focused row fills with `#00D2FF`, and the chosen one is white with a check. It opens on the chosen option (or the first); directions move, confirm chooses and closes, and back or a click outside closes without choosing. Focus returns to the select. It is the app's own list, not the system's, so it works with the gamepad too.
- **Actions** at the bottom right: the way out first (Back or Cancel), then the one that submits. The submit button is unavailable until the form is complete: Slate Dim text and a quiet border, still focusable (focused, a cyan outline without the fill) but doing nothing.
- **Input:** a deliberate exception to gamepad-first: text is typed with a physical keyboard only (no on-screen keyboard). The gamepad still moves focus, presses the buttons and uses selects. Pointing at a field doesn't focus it, so moving the mouse never takes focus away from the field being typed in.

### Add Emulator (Settings)
- Opened with Add emulator, in place of the emulators list; Back (the button, the back action or Esc) returns to the list.
- Fields: the application path first (focused when the form opens; the picker chooses a file), then the emulator's name. Choosing an application in the picker fills the name in from it (unless the user typed one) and shows at once why it can't be an emulator, if so. Actions: Back and Add emulator, unavailable until both fields are filled in. Adding returns to the list, which shows the new emulator; a problem (not found, a folder, not allowed to run, not an AppImage, already added) shows below the path instead.

### Emulator Details (Settings)
- Opened by confirming an emulator in the list, in its place; Back (the button, the back action or Esc) returns to the list.
- **Header:** the emulator's name in `headline-sm` white, its version below as an uppercase `label-md` line in Slate Muted (left out when it reports none). No keyboard note: nothing is typed here.
- **Open emulator**, below the header on the left: the screen's main action, focused when it opens. It opens the emulator on its own, in full screen on its menu, to set it up there (e.g. install RetroArch's cores); what the user changes is saved by the emulator as usual. Ilnamiki comes back in front when it closes and reads the emulators and platforms again. One emulator runs at a time, playing or being set up; why it didn't open (gone, another one or a game open, its application couldn't start) shows below in Error `body-md`.
- **Application path:** an uppercase `label-md` label in Slate Muted, then the path across the whole width in a read-only box shaped like a text field (`#1B1F2D`, 1px border, 8px radius, `body-md`, wrapping long paths), with a Change path button (`folder-open` icon and text) beside it, on the right. Change path opens the system's file picker and saves the chosen application at once, detecting it again (the name stays). A problem shows below in Error `body-md`, and nothing changes.
- **Remove from Ilnamiki:** a section of its own after the path, set apart by a 1px border line above: an uppercase `label-md` label and that its application stays on the computer in Slate Muted `body-md`, with Remove emulator below them, a destructive button: Error (`#FFB4AB`) border and text at rest; focused, it fills with the Error container (`#93000A`) with `#FFDAD6` text and a soft red halo. Destructive actions are never the main one nor where focus lands by default.
- **Back**, alone at the bottom right. Focus moves by rows (see Focus movement in Settings): down from Open emulator goes to Change path, then Remove emulator (which still asks first), then Back, and up the same way back.
- **Removing** asks first, in a confirmation dialog: `Remove <name>?` and that its application stays on the computer, with Cancel (focused first, so an accidental confirm does nothing) and a red Remove. Removing returns to the list.
- When the emulator is gone (e.g. removed elsewhere), the shared empty layout says so with a Back button.

### Confirmation Dialog
- Asks before something that can't be undone, centered over the blurred screen (`#121624` at 65% with 40px blur) in a 640px box (`#121624` at 85%, 1px strong border, 16px radius, 32px padding): the question in `headline-sm`, what confirming does in Slate Muted `body-md`, then Cancel and the confirm button at the bottom right (red when destructive).
- Modal: the screen behind gets no input; Cancel takes focus first; back, Esc or a click outside cancel; focus returns where it was.

### Add Game Folder (Settings)
- Opened with Add folder, in place of the game folders list, in two steps: the form, then the scan results. From the form, Cancel, the back action or Esc returns to the list.
- **Form:** the folder path first (focused when the form opens; the picker only chooses folders), then the platform its games belong to, a select of the installed platforms. Each platform has one folder at most: platforms that already have one aren't in the select, and a Slate Muted `body-md` note below it says so. Which emulator and core play a platform is chosen per platform, not per folder. Actions: Cancel and Scan, unavailable until both fields are filled in. A folder that can't be scanned (not found, a file, not readable, already added, a platform that has a folder or no core anymore) returns here with why below the path.
- **Scan results:** the title (`Scanning folder`, then `Games found`) in `headline-sm` white, with the folder and its platform below in Slate Muted `body-md`. While scanning, a 12px pill-shaped progress bar (Info fill on the raised surface) with its percent beside it. Then, an uppercase `label-md` summary in Slate Muted (`38 games · 2 damaged`) and the games found by title, each a `#1B1F2D` row with a 1px border and 12px radius: a 14px status dot with a soft glow (Success when it can be played, Error when it is damaged; never cyan, which is kept for focus) and the title in `body-lg`. A damaged game adds, below its title, why and what to do in Error `body-md` (e.g. `Missing "Track 2.bin". Check that the file is in the folder.`), so its state never depends on color alone. The focused row gets the cyan border and glow, and the list scrolls to keep it in view. Without playable games, a Warning `body-md` message with a warning-triangle icon says so (`No games available in this folder.`, or `No playable games in this folder.` when all are damaged).
- Actions at the bottom right: Back (focused when the step opens) and Save folder, unavailable until the scan finds a playable game. Back, the back action or Esc return to the form as it was, cancelling a scan still running. Save folder keeps the playable games (damaged ones aren't imported) and returns to the list; a problem saving shows above the actions in Error `body-md`.

### Game Folder Details (Settings)
- Opened by confirming a folder in the list, in its place; Back (the button, the back action or Esc) returns to the list.
- **Header:** the folder's platform in `headline-sm` white (its id when no installed core plays it anymore), the number of games below as an uppercase `label-md` line in Slate Muted.
- **Folder path:** an uppercase `label-md` label in Slate Muted, then the path across the whole width in the same read-only box as an emulator's path (`body-md`), with a Change path button (`folder-open` icon and text) beside it, on the right. A folder no longer on disk adds `Folder not available` below, as in the list; a folder that couldn't be scanned again, or moved, adds why in Error `body-md`.
- **Change path** opens the system's folder picker; the folder chosen (unless it is the same one, or the picker is cancelled) is scanned in the scan results step, as Scan again does, and Save changes moves the folder there. Games keep their place inside the folder, so a game found at the same place is the same game, with its history; those not found are removed as in Scan again. A folder another one already uses can't be chosen: the details say so. Back, the back action or Esc in the step leave the folder where it was.
- **Games:** an uppercase `label-md` label, then the games saved from the folder by title, each a `#1B1F2D` row with a 1px border and 12px radius and the title in `body-lg`, with no status dot (only playable games are saved). The list takes the room left and scrolls to keep the focused row in view. Without games, or when they can't be read, a Slate Muted `body-md` line says so.
- **Folder actions**, in one row below the header, above the path and the games, so a long list never keeps them out of reach: Scan again on the left, focused when the screen opens and when the scan step returns, and Remove folder apart on the right, a destructive button (as Remove emulator). Down from Scan again goes to Change path, never to Remove folder, which is reached to the right.
- **Back**, alone at the bottom right (the back action does the same). Focus moves by rows (see Focus movement in Settings).
- **Removing** asks first, in a confirmation dialog: `Remove the <platform> folder?`, that its games leave the library while the files stay on the computer and adding the folder again brings them back, with Cancel focused first and a red Remove. The games keep their history. Removing returns to the list.
- **Scan again** opens the scan results step of Add Game Folder in place of the details, with Save changes instead of Save folder. Saving adds the new playable games, removes those no longer found (their history stays, and they come back if found again) and returns to the details with the list read again. Back, the back action or Esc return to the details saving nothing, cancelling a scan still running; a folder that can't be scanned returns to them with why.
- When the folder is gone, the shared empty layout says so with a Back button.

### Metric Chips & Status Badges
- Rendered with background `#121624` (85% opacity) and 1px border.
- Active states (e.g., "ONLINE", "60 FPS", "CORE LOADED") display a 8px pulsing dot in `#00FFA3` accompanied by monospace text.

### Dialog Modals & Configuration Sheets
- Centered 960px fixed-width dialog, `#121624` background with 40px backdrop blur and 20px border radius.
- Encircled by a quiet 1px border (`#00D2FF` at 30% opacity).
- Primary confirmation actions are illuminated in full `#00D2FF` fill with black text (`#0B0D14`) for instantaneous contrast recognition.