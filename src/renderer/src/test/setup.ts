import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll } from 'vitest'

import i18n, { DEFAULT_LANGUAGE } from '@renderer/core/i18n'

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

beforeAll(async () => {
  await i18n.changeLanguage(DEFAULT_LANGUAGE)
})

afterEach(() => {
  cleanup()
})
