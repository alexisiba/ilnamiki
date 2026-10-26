import { loadEffects, playEffect } from './audioOutput'
import { UI_SOUND_PRIORITY, type UiSound } from './sounds'

/** The sound the input being handled asked for, if any, until it plays. */
let pending: UiSound | undefined

const priorityOf = (sound: UiSound): number => UI_SOUND_PRIORITY.indexOf(sound)

function playPending(): void {
  const sound = pending
  pending = undefined
  if (sound) playEffect(sound)
}

/** Loads the sound effects, so the first ones asked for already play. */
export function preloadUiSounds(): Promise<void> {
  return loadEffects()
}

/**
 * Plays `sound` once the current input is handled. One input may ask for several (e.g.
 * moving focus also slides a carousel): only the one highest in `UI_SOUND_PRIORITY` plays.
 */
export function playUiSound(sound: UiSound): void {
  if (pending === undefined) queueMicrotask(playPending)
  if (pending === undefined || priorityOf(sound) > priorityOf(pending)) pending = sound
}
