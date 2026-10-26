import back from '@renderer/assets/sounds/ui/back.ogg'
import backgroundMusic from '@renderer/assets/sounds/ui/background-music.ogg'
import cantMove from '@renderer/assets/sounds/ui/cant-move.ogg'
import carouselSlide from '@renderer/assets/sounds/ui/carousel-slide.ogg'
import keyPress from '@renderer/assets/sounds/ui/key-press.ogg'
import move from '@renderer/assets/sounds/ui/move.ogg'
import select from '@renderer/assets/sounds/ui/select.ogg'
import switchTab from '@renderer/assets/sounds/ui/switch-tab.ogg'

/**
 * Sound effects of the interface, from lowest to highest priority: when one input asks for
 * several, only the highest plays (see `playUiSound`).
 */
export const UI_SOUND_PRIORITY = [
  'cant-move',
  'move',
  'select',
  'back',
  'carousel-slide',
  'switch-tab',
  'key-press'
] as const

export type UiSound = (typeof UI_SOUND_PRIORITY)[number]

/** The file of each sound effect. */
export const UI_SOUND_URLS: Record<UiSound, string> = {
  'cant-move': cantMove,
  move,
  select,
  back,
  'carousel-slide': carouselSlide,
  'switch-tab': switchTab,
  'key-press': keyPress
}

/** The music that plays behind the menus, in a loop. */
export const BACKGROUND_MUSIC_URL = backgroundMusic

/** Volume of the sound effects, from 0 to 1. */
export const UI_SOUND_VOLUME = 0.4

/** Volume of the background music, from 0 to 1. */
export const MUSIC_VOLUME = 0.1
