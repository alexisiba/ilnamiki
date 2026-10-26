import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, vi } from 'vitest'

import { resetBackgroundMusic } from '@renderer/core/audio/backgroundMusic'
import i18n, { DEFAULT_LANGUAGE } from '@renderer/core/i18n'
import { DEFAULT_INPUT_DEVICE, setActiveInputDevice } from '@renderer/core/input/activeDevice'
import { resetEmulators } from '@renderer/core/ipc/emulators'
import { resetGameFolders } from '@renderer/core/ipc/gameFolders'
import { resetLastPlayedGame } from '@renderer/core/ipc/lastPlayedGame'
import { resetPlatforms } from '@renderer/core/ipc/platforms'

import { mockApi } from './api'
import { resetAudio } from './audio'
import { disconnectAllGamepads, getFakeGamepads } from './gamepad'
import { getMockedRect } from './layout'

// jsdom has no Web Audio and can't play media: sounds go to a fake that records them.
vi.mock('@renderer/core/audio/audioOutput', () => import('./audio'))

// jsdom has no layout: rects come from `setRect` and scrolling does nothing.
Element.prototype.getBoundingClientRect = function (this: Element): DOMRect {
  return getMockedRect(this)
}
Element.prototype.scrollIntoView = function (): void {
  // No layout to scroll.
}
Element.prototype.scrollTo = function (): void {
  // No layout to scroll.
}

// jsdom has no modal dialogs: opening toggles `open` and focuses the first control, as browsers
// do, and closing toggles `open` back (no top layer or inertness).
HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement): void {
  this.setAttribute('open', '')
  this.querySelector<HTMLElement>('input, select, textarea, button, [tabindex]')?.focus()
}
HTMLDialogElement.prototype.close = function (this: HTMLDialogElement): void {
  this.removeAttribute('open')
}

// jsdom has no Gamepad API: gamepads come from `connectGamepad`.
Object.defineProperty(navigator, 'getGamepads', {
  configurable: true,
  value: getFakeGamepads
})

beforeAll(async () => {
  await i18n.changeLanguage(DEFAULT_LANGUAGE)
})

beforeEach(() => {
  mockApi()
})

afterEach(() => {
  cleanup()
  disconnectAllGamepads()
  // The active device is app-wide state; each test starts from the default.
  setActiveInputDevice(DEFAULT_INPUT_DEVICE)
  // So are the emulators, platforms, game folders and last played game read from main.
  resetEmulators()
  resetPlatforms()
  resetGameFolders()
  resetLastPlayedGame()
  // And what played.
  resetAudio()
  resetBackgroundMusic()
})
