import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll } from 'vitest'

import i18n, { DEFAULT_LANGUAGE } from '@renderer/core/i18n'
import { DEFAULT_INPUT_DEVICE, setActiveInputDevice } from '@renderer/core/input/activeDevice'

import { disconnectAllGamepads, getFakeGamepads } from './gamepad'
import { getMockedRect } from './layout'

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

// jsdom has no Gamepad API: gamepads come from `connectGamepad`.
Object.defineProperty(navigator, 'getGamepads', {
  configurable: true,
  value: getFakeGamepads
})

beforeAll(async () => {
  await i18n.changeLanguage(DEFAULT_LANGUAGE)
})

afterEach(() => {
  cleanup()
  disconnectAllGamepads()
  // The active device is app-wide state; each test starts from the default.
  setActiveInputDevice(DEFAULT_INPUT_DEVICE)
})
