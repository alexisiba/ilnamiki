import type { UiSound } from '@renderer/core/audio'

/*
 * A fake of `core/audio/audioOutput`, which `setup.ts` puts in its place: jsdom has no Web
 * Audio and can't play media. It records what would sound.
 */

let played: UiSound[] = []
let musicPlaying = false

export async function loadEffects(): Promise<void> {
  // Nothing to load.
}

export function playEffect(sound: UiSound): void {
  played.push(sound)
}

export function playMusic(): void {
  musicPlaying = true
}

export function pauseMusic(): void {
  musicPlaying = false
}

/** The sound effects played so far in the test, in order. */
export function getPlayedSounds(): UiSound[] {
  return played
}

/** Whether the background music is playing. */
export function isMusicPlaying(): boolean {
  return musicPlaying
}

/** Forgets what played, so each test starts silent. */
export function resetAudio(): void {
  played = []
  musicPlaying = false
}
