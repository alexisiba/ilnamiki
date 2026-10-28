import { describe, expect, it, vi } from 'vitest'

import {
  artworkIdentityOf,
  type DescribedGame,
  describeGame,
  type FileState,
  type GameToDescribe
} from './gameMetadata.describe'
import { NO_DETAILS } from './gameMetadata.fallback'
import type { MetadataProviders } from './gameMetadata.providers'
import { type GameIdentity, MetadataUnavailableError } from './gameMetadata.types'

const FILE: FileState = { size: 32768, modifiedAt: 1000 }

const GAME: GameToDescribe = {
  id: 'g1',
  platformId: 'game_boy',
  filePath: '/roms/gb/tetris.gb',
  lookedAtFile: null,
  identity: null,
  isArtworkAsked: false
}

const IDENTITY: GameIdentity = {
  providerId: 'libretro-database',
  database: 'Nintendo - Game Boy',
  name: 'Tetris (World) (Rev 1)',
  identifiedBy: 'crc'
}

/** Providers that know `identity` (none when null), with `title` as its details. */
function providers(identity: GameIdentity | null): MetadataProviders {
  return {
    identifiers: [{ id: 'libretro-database', identify: vi.fn(async () => identity) }],
    details: [
      {
        id: 'libretro-database',
        details: vi.fn(async () => ({ ...NO_DETAILS, title: 'Tetris' }))
      }
    ],
    artwork: []
  }
}

const fileIs = (state: FileState | null): ((path: string) => Promise<FileState | null>) =>
  vi.fn(async () => state)

describe('describeGame', () => {
  it('describes a game never looked at: its identity, its details and its file', async () => {
    expect(await describeGame(GAME, providers(IDENTITY), fileIs(FILE))).toEqual({
      gameId: 'g1',
      identity: IDENTITY,
      details: { ...NO_DETAILS, title: 'Tetris' },
      file: FILE
    })
  })

  it('describes a game no identifier knows without asking for details', async () => {
    const unknown = providers(null)

    expect(await describeGame(GAME, unknown, fileIs(FILE))).toEqual({
      gameId: 'g1',
      identity: null,
      details: NO_DETAILS,
      file: FILE
    })
    expect(unknown.details[0].details).not.toHaveBeenCalled()
  })

  it('leaves a game whose file is as it was when last looked at, since it is asked once', async () => {
    const known = providers(IDENTITY)

    expect(await describeGame({ ...GAME, lookedAtFile: FILE }, known, fileIs(FILE))).toBeNull()
    expect(known.identifiers[0].identify).not.toHaveBeenCalled()
  })

  it('describes a game again when its file changed', async () => {
    const changed = { ...FILE, modifiedAt: 2000 }

    expect(
      await describeGame({ ...GAME, lookedAtFile: FILE }, providers(IDENTITY), fileIs(changed))
    ).toMatchObject({ file: changed })
  })

  it('leaves a game whose file is gone', async () => {
    expect(await describeGame(GAME, providers(IDENTITY), fileIs(null))).toBeNull()
  })

  it('throws when a provider couldn’t look, so the game isn’t taken as asked', async () => {
    const unavailable: MetadataProviders = {
      identifiers: [
        {
          id: 'libretro-database',
          identify: async () => {
            throw new MetadataUnavailableError('No database')
          }
        }
      ],
      details: [],
      artwork: []
    }

    await expect(describeGame(GAME, unavailable, fileIs(FILE))).rejects.toThrow(
      MetadataUnavailableError
    )
  })
})

describe('artworkIdentityOf', () => {
  const described = (identity: GameIdentity | null): DescribedGame => ({
    gameId: 'g1',
    identity,
    details: NO_DETAILS,
    file: FILE
  })

  it('looks for the artwork of a game just described, with its new identity', () => {
    const before = { ...GAME, identity: { ...IDENTITY, name: 'Old' }, isArtworkAsked: true }

    expect(artworkIdentityOf(before, described(IDENTITY))).toEqual(IDENTITY)
  })

  it('looks for the artwork a game described before never had all asked', () => {
    expect(artworkIdentityOf({ ...GAME, identity: IDENTITY }, null)).toEqual(IDENTITY)
  })

  it('looks for nothing once the artwork was all asked, or for an unidentified game', () => {
    expect(
      artworkIdentityOf({ ...GAME, identity: IDENTITY, isArtworkAsked: true }, null)
    ).toBeNull()
    expect(artworkIdentityOf(GAME, null)).toBeNull()
    expect(artworkIdentityOf(GAME, described(null))).toBeNull()
  })
})
