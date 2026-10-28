import { describe, expect, it } from 'vitest'

import noScreenshot from '@renderer/assets/images/games/no-bg-image.webp'
import noImage from '@renderer/assets/images/games/no-image.webp'

import { backdropOf, coverOf } from './gameArtwork'

const COVER = 'ilnamiki-artwork://game/g1/cover?v=1'
const TITLE = 'ilnamiki-artwork://game/g1/title-screen?v=1'
const SCREENSHOT = 'ilnamiki-artwork://game/g1/screenshot?v=1'
const NONE = { cover: null, titleScreen: null, screenshot: null }

describe('backdropOf', () => {
  it('shows the game’s screenshot, with sharp pixels', () => {
    expect(backdropOf({ cover: COVER, titleScreen: TITLE, screenshot: SCREENSHOT })).toEqual({
      url: SCREENSHOT,
      isPixelArt: true
    })
  })

  it('shows its title screen while it has no screenshot', () => {
    expect(backdropOf({ ...NONE, titleScreen: TITLE })).toEqual({ url: TITLE, isPixelArt: true })
  })

  it('shows a generic image, drawn smoothly, while it has neither', () => {
    expect(backdropOf({ ...NONE, cover: COVER })).toEqual({ url: noScreenshot, isPixelArt: false })
  })
})

describe('coverOf', () => {
  it('shows the game’s cover, or a generic image while it has none', () => {
    expect(coverOf({ ...NONE, cover: COVER })).toBe(COVER)
    expect(coverOf(NONE)).toBe(noImage)
  })
})
