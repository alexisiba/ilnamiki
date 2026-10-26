---
name: ui-audio
description: How Ilnamiki plays sound in the renderer — UI sound effects through the Web Audio API (decoded once, restarted when repeated quickly) and background music streamed through a media element, all in core/audio; which sound each kind of interaction plays and when it stays silent, one sound per input resolved by priority, volumes as constants, music paused while a game runs, asset format and location, and testing with the fake audio output. Use whenever adding, changing or triggering a sound effect or music, adding an audio asset, or touching src/renderer/src/core/audio.
---

# UI Audio

Sound is part of what makes Ilnamiki feel like a console: every move, confirm and back
answers with a short sound, and music plays behind the menus. This skill decides how sound is
played and when.

Related skills: `ilnamiki-ui` (input actions and focus, which sounds follow),
`react-testing` (how tests run), `utils-placement` (stateful code goes to `core/`).

## 1. Where audio lives

- All audio code lives in `src/renderer/src/core/audio/`. Features and components never
  create an `AudioContext`, an `Audio` or an `<audio>` element: they call `core/audio`.
  - `sounds.ts`: the catalog. Each UI sound by name (`UiSound`), its file, the priority
    order and the volumes.
  - `audioOutput.ts`: the **only** file that touches the Web Audio API and media elements.
    Everything else goes through it, so tests can replace it (see §7).
  - `uiSounds.ts` and `backgroundMusic.ts`: what the app asks for (play this effect, start,
    pause or resume the music), on top of the output.
- Files live in `src/renderer/src/assets/sounds/ui/`, named in kebab-case: effects after the
  interaction, the same name as their `UiSound` (`cant-move.ogg`), and the menus' music
  `background-music.ogg`.
- **Format: Ogg Vorbis (`.ogg`).** Chromium plays it natively. Convert other formats before
  adding them (e.g. `ffmpeg -i in.mp3 -c:a libvorbis -q:a 4 out.ogg`); never ship both.

## 2. Effects: Web Audio API

UI effects are short and must sound the instant the input happens, as often as the user
presses.

- Each effect is fetched and decoded **once** into an `AudioBuffer` when the app starts
  (`preloadUiSounds`). An effect asked for before its buffer is ready is skipped, never
  delayed: a late sound is worse than none.
- Every play is a new `AudioBufferSourceNode` (they are single-use) connected to the
  effects' gain node.
- **Repeating restarts.** Playing an effect that is still sounding stops it and starts it
  again from the beginning. Effects never overlap with themselves.
- Never use `<audio>` / `HTMLAudioElement` for effects: it has more latency, and restarting
  it quickly (`currentTime = 0`) is unreliable.

## 3. Music: a streamed media element

Music is long and only needs to start, loop, pause and resume.

- It plays through one `HTMLAudioElement` with `loop`, which streams the file. Never decode
  music into an `AudioBuffer`: minutes of decoded audio take tens of megabytes of memory.
- It starts when the app opens and **pauses while a game is being played**, since the
  emulator has its own sound, and resumes when the game ends.
- Electron's default autoplay policy (`autoplayPolicy: 'no-user-gesture-required'`) lets
  audio start without a user gesture; gamepad input never counts as one. Don't change it.
- A rejected `play()` is caught and ignored: the music simply doesn't play.

## 4. Volume

- Volumes are two constants in `sounds.ts`, from 0 to 1: `UI_SOUND_VOLUME` for every effect
  and `MUSIC_VOLUME` for the music. Never set a volume anywhere else, and never adjust a single sound's file or call to make
  it louder or quieter; fix the file instead.
- When the user gets volume or mute settings, they change these gains in `core/audio`, not
  each caller.

## 5. Which sound, and when

Sounds follow **what happened**, not the button pressed. Play a sound where the effect
happens, in the handler that does it.

| Sound | Plays when |
|---|---|
| `move` | A direction moves focus (navigation does it) |
| `cant-move` | A direction finds nowhere to go, on each press (not on held repeats); also confirming an inert control (`aria-disabled`) |
| `select` | A focusable element is confirmed or clicked (`useFocusable` does it) |
| `back` | Back actually does something: takes a step back, leaves the screen, closes a dialog |
| `carousel-slide` | A carousel's selected item changes |
| `switch-tab` | The top bar's section changes, and only then. Lists inside a screen that select as focus moves (e.g. Settings' categories) are not tabs: they play `move` and `select` like any other item |
| `key-press` | A key of the on-screen keyboard is pressed, by confirm, pointer or its shortcut button |

Silent on purpose:

- **Hovering** with the mouse: sweeping the pointer would fire a burst of `move`. Clicks
  still play.
- **Typing on the physical keyboard**: the keyboard makes its own sound.
- **Back with nothing to go back to** (a section's root), and selecting what is already
  selected (the current tab or carousel item).
- Focus that the app moves by itself (a screen opening, focus being restored).

## 6. One sound per input

One input often triggers several handlers: moving inside a carousel moves focus (`move`) and
slides the carousel (`carousel-slide`); confirming a keyboard key clicks it (`select`) and
types (`key-press`). Only one sound must play.

- `playUiSound` doesn't play right away: it collects what the current input asked for and,
  once the input is handled (a microtask), plays only the one highest in
  `UI_SOUND_PRIORITY`. Call it freely from every handler that does something; the most
  specific sound wins.
- Priority, highest first: `key-press`, `switch-tab`, `carousel-slide`, `back`, `select`,
  `move`, `cant-move`.
- This only merges sounds asked for in the same task. A component that plays its own sound
  in a later event (e.g. a click after the pointer press that already selected it) opts out
  of the default one: `useFocusable({ sound: false })`.
- Don't play sounds from React effects: they run after rendering, outside the input's task,
  so they escape the priority and may play twice in Strict Mode.

## 7. Testing

- jsdom has no Web Audio and can't play media, so `test/setup.ts` replaces `audioOutput.ts`
  with the fake in `test/audio.ts`. Everything above the output is the real code.
- Test that interactions play the right sound with `getPlayedSounds()` from `test/audio.ts`,
  after the input is handled (user-event awaits it; after a sync `emitInput`, `await` a
  resolved promise first). The fake also reports whether the music is playing.
- Test the logic of `core/audio` (priority, restart, music state) against the fake; never
  assert on volumes or buffers.

## Checklist

- [ ] Audio only through `core/audio`; no `Audio`, `<audio>` or `AudioContext` elsewhere.
- [ ] Effects through `playUiSound`, played where the effect happens, with the most specific
      sound for it.
- [ ] Nothing plays on hover, on physical typing or when nothing happened (except
      `cant-move`).
- [ ] New sounds are `.ogg` in `assets/sounds/`, added to `sounds.ts` and its priority.
- [ ] Volumes only in `sounds.ts`.
- [ ] Tests check the sound played through the fake output.
