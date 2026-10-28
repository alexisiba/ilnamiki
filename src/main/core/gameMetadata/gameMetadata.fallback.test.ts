import { describe, expect, it, vi } from 'vitest'

import {
  fillMissing,
  findArtwork,
  findDetails,
  identifyGame,
  NO_DETAILS
} from './gameMetadata.fallback'
import type {
  ArtworkUrl,
  ContentProvider,
  GameDetails,
  GameIdentity,
  Identifier
} from './gameMetadata.types'

const GAME = { platformId: 'game_boy', filePath: '/roms/gb/Tetris.gb' }

const IDENTITY: GameIdentity = {
  providerId: 'libretro-database',
  database: 'Nintendo - Game Boy',
  name: 'Tetris (World) (Rev 1)',
  identifiedBy: 'crc'
}

const identifier = (identity: GameIdentity | null): Identifier => ({
  id: 'libretro-database',
  identify: vi.fn(async () => identity)
})

const detailsProvider = (details: Partial<GameDetails> | null): ContentProvider => ({
  id: 'libretro-database',
  details: vi.fn(async () => details && { ...NO_DETAILS, ...details })
})

const COMPLETE: GameDetails = {
  title: 'Tetris',
  releaseYear: 1989,
  releaseMonth: 6,
  developer: 'Nintendo',
  publisher: 'Nintendo',
  genre: 'Puzzle',
  players: 2
}

describe('identifyGame', () => {
  it('takes the identity of the first identifier that knows the game', async () => {
    const unknown = identifier(null)
    const known = identifier(IDENTITY)
    const later = identifier({ ...IDENTITY, name: 'Other' })

    expect(await identifyGame([unknown, known, later], GAME)).toEqual(IDENTITY)
    expect(later.identify).not.toHaveBeenCalled()
  })

  it('says nothing when no identifier knows the game', async () => {
    expect(await identifyGame([identifier(null)], GAME)).toBeNull()
    expect(await identifyGame([], GAME)).toBeNull()
  })
})

describe('fillMissing', () => {
  it('fills only what isn’t known, never changing a known value', () => {
    expect(
      fillMissing(
        { ...NO_DETAILS, title: 'Tetris', releaseYear: 1989 },
        { ...NO_DETAILS, title: 'TETRIS', genre: 'Puzzle' }
      )
    ).toEqual({ ...NO_DETAILS, title: 'Tetris', releaseYear: 1989, genre: 'Puzzle' })
  })
})

describe('findDetails', () => {
  it('takes each field from the first provider that knows it', async () => {
    const first = detailsProvider({ title: 'Tetris', releaseYear: 1989 })
    const second = detailsProvider({ title: 'Other', genre: 'Puzzle' })

    expect(await findDetails([first, second], IDENTITY)).toEqual({
      ...NO_DETAILS,
      title: 'Tetris',
      releaseYear: 1989,
      genre: 'Puzzle'
    })
  })

  it('asks no more providers once every field is known', async () => {
    const later = detailsProvider({ title: 'Other' })

    expect(await findDetails([detailsProvider(COMPLETE), later], IDENTITY)).toEqual(COMPLETE)
    expect(later.details).not.toHaveBeenCalled()
  })

  it('skips providers that don’t know the game or don’t give details', async () => {
    const withoutDetails: ContentProvider = { id: 'libretro-database' }

    expect(
      await findDetails(
        [detailsProvider(null), withoutDetails, detailsProvider({ players: 2 })],
        IDENTITY
      )
    ).toEqual({ ...NO_DETAILS, players: 2 })
  })

  it('leaves empty what no provider knows', async () => {
    expect(await findDetails([], IDENTITY)).toEqual(NO_DETAILS)
  })
})

describe('findArtwork', () => {
  const artworkProvider = (urls: ArtworkUrl[]): ContentProvider => ({
    id: 'libretro-thumbnails',
    artwork: vi.fn(async () => urls)
  })

  /** Downloads every URL but those of `missing`, keeping each as "<url>.file". */
  const downloadAllBut =
    (...missing: string[]) =>
    async (_kind: string, url: string): Promise<string | null> =>
      missing.includes(url) ? null : `${url}.file`

  it('finds each kind’s image at the first provider that names it', async () => {
    const first = artworkProvider([
      { kind: 'cover', url: 'first/cover' },
      { kind: 'screenshot', url: 'first/screenshot' }
    ])
    const second = artworkProvider([
      { kind: 'cover', url: 'second/cover' },
      { kind: 'title-screen', url: 'second/title' }
    ])

    expect(await findArtwork([first, second], IDENTITY, downloadAllBut())).toEqual([
      { kind: 'cover', path: 'first/cover.file' },
      { kind: 'title-screen', path: 'second/title.file' },
      { kind: 'screenshot', path: 'first/screenshot.file' }
    ])
  })

  it('asks the next provider for a kind whose image turned out to be missing', async () => {
    const first = artworkProvider([{ kind: 'cover', url: 'first/cover' }])
    const second = artworkProvider([{ kind: 'cover', url: 'second/cover' }])

    expect(
      (await findArtwork([first, second], IDENTITY, downloadAllBut('first/cover')))[0]
    ).toEqual({ kind: 'cover', path: 'second/cover.file' })
  })

  it('leaves empty the kinds no provider has, asking each provider once', async () => {
    const only = artworkProvider([{ kind: 'cover', url: 'only/cover' }])
    const withoutArtwork: ContentProvider = { id: 'libretro-database' }

    expect(
      await findArtwork([withoutArtwork, only], IDENTITY, downloadAllBut('only/cover'))
    ).toEqual([
      { kind: 'cover', path: null },
      { kind: 'title-screen', path: null },
      { kind: 'screenshot', path: null }
    ])
    expect(only.artwork).toHaveBeenCalledTimes(1)
  })

  it('fails when an image couldn’t be asked for, so the game is tried again', async () => {
    const provider = artworkProvider([{ kind: 'cover', url: 'cover' }])
    const offline = async (): Promise<string | null> => {
      throw new Error('fetch failed')
    }

    await expect(findArtwork([provider], IDENTITY, offline)).rejects.toThrow('fetch failed')
  })
})
