import {
  BACKGROUND_MUSIC_URL,
  MUSIC_VOLUME,
  UI_SOUND_URLS,
  UI_SOUND_VOLUME,
  type UiSound
} from './sounds'

/*
 * The only place that touches the Web Audio API and media elements; tests replace it with
 * the fake in `test/audio.ts`.
 */

let effects: { context: AudioContext; gain: GainNode } | undefined
const buffers = new Map<UiSound, AudioBuffer>()
/** The source of each effect still sounding, to stop it when the effect plays again. */
const sounding = new Map<UiSound, AudioBufferSourceNode>()
let music: HTMLAudioElement | undefined

function getEffects(): { context: AudioContext; gain: GainNode } {
  if (!effects) {
    const context = new AudioContext()
    const gain = context.createGain()
    gain.gain.value = UI_SOUND_VOLUME
    gain.connect(context.destination)
    effects = { context, gain }
  }
  return effects
}

/** Fetches and decodes every sound effect once, so they play without delay. */
export async function loadEffects(): Promise<void> {
  const { context } = getEffects()
  await Promise.all(
    Object.entries(UI_SOUND_URLS).map(async ([sound, url]) => {
      if (buffers.has(sound as UiSound)) return
      try {
        const response = await fetch(url)
        buffers.set(sound as UiSound, await context.decodeAudioData(await response.arrayBuffer()))
      } catch (error) {
        console.error(`Could not load the sound "${sound}":`, error)
      }
    })
  )
}

/**
 * Plays `sound` from its beginning, stopping it first if it is still sounding. Skipped while
 * its file isn't loaded: a late sound is worse than none.
 */
export function playEffect(sound: UiSound): void {
  const buffer = buffers.get(sound)
  if (!buffer) return
  const { context, gain } = getEffects()

  sounding.get(sound)?.stop()
  const source = context.createBufferSource()
  source.buffer = buffer
  source.connect(gain)
  source.onended = () => {
    if (sounding.get(sound) === source) sounding.delete(sound)
  }
  sounding.set(sound, source)
  source.start()
}

/** Plays the background music in a loop, from where it was paused. */
export function playMusic(): void {
  if (!music) {
    music = new Audio(BACKGROUND_MUSIC_URL)
    music.loop = true
    music.volume = MUSIC_VOLUME
  }
  // Refused (e.g. by an autoplay policy): the music simply doesn't play.
  music.play().catch(() => undefined)
}

/** Pauses the background music, to resume it where it was. */
export function pauseMusic(): void {
  music?.pause()
}
