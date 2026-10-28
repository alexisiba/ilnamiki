import { describe, expect, it } from 'vitest'

import { artworkUrl, parseArtworkUrl, toGameArtwork } from './artworkUrls'

const GAME_ID = '0618ed66-3a1c-4fce-b74a-abfc2a082200'

describe('artworkUrl', () => {
  it('names a game’s image by its game, its kind and when it was found', () => {
    expect(artworkUrl(GAME_ID, 'title-screen', 7)).toBe(
      `ilnamiki-artwork://game/${GAME_ID}/title-screen?v=7`
    )
  })
})

describe('parseArtworkUrl', () => {
  it('reads the game and the kind an image URL asks for, whatever its version', () => {
    expect(parseArtworkUrl(artworkUrl(GAME_ID, 'cover', 7))).toEqual({
      gameId: GAME_ID,
      kind: 'cover'
    })
    expect(parseArtworkUrl(`ilnamiki-artwork://game/${GAME_ID}/screenshot`)).toEqual({
      gameId: GAME_ID,
      kind: 'screenshot'
    })
  })

  it('refuses anything else, so no other file can be asked for', () => {
    expect(parseArtworkUrl(`ilnamiki-artwork://game/${GAME_ID}/manual`)).toBeNull()
    expect(parseArtworkUrl(`ilnamiki-artwork://game/${GAME_ID}/cover/extra`)).toBeNull()
    expect(parseArtworkUrl('ilnamiki-artwork://game/../../etc/passwd/cover')).toBeNull()
    expect(parseArtworkUrl(`ilnamiki-artwork://other/${GAME_ID}/cover`)).toBeNull()
    expect(parseArtworkUrl(`file:///game/${GAME_ID}/cover`)).toBeNull()
    expect(parseArtworkUrl('not a url')).toBeNull()
  })
})

describe('toGameArtwork', () => {
  it('gives a URL for each kind the game has a file of, and null for the rest', () => {
    expect(
      toGameArtwork(GAME_ID, {
        cover_version: 7,
        title_screen_version: null,
        screenshot_version: 9
      })
    ).toEqual({
      cover: artworkUrl(GAME_ID, 'cover', 7),
      titleScreen: null,
      screenshot: artworkUrl(GAME_ID, 'screenshot', 9)
    })
  })
})
