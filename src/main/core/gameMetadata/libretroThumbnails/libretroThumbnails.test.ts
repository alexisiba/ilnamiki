import { describe, expect, it } from 'vitest'

import type { GameIdentity } from '../gameMetadata.types'
import { libretroThumbnails, thumbnailUrls } from './libretroThumbnails'

describe('thumbnailUrls', () => {
  it('names a cover, a title screen and a screenshot in the database’s folders', () => {
    expect(thumbnailUrls('Nintendo - Game Boy', 'Tetris (World) (Rev 1)')).toEqual([
      {
        kind: 'cover',
        url: 'https://thumbnails.libretro.com/Nintendo%20-%20Game%20Boy/Named_Boxarts/Tetris%20(World)%20(Rev%201).png'
      },
      {
        kind: 'title-screen',
        url: 'https://thumbnails.libretro.com/Nintendo%20-%20Game%20Boy/Named_Titles/Tetris%20(World)%20(Rev%201).png'
      },
      {
        kind: 'screenshot',
        url: 'https://thumbnails.libretro.com/Nintendo%20-%20Game%20Boy/Named_Snaps/Tetris%20(World)%20(Rev%201).png'
      }
    ])
  })

  it('replaces the characters libretro leaves out of names, and encodes the rest', () => {
    const [cover] = thumbnailUrls(
      'Sega - Mega Drive - Genesis',
      'Sonic & Knuckles + Sonic 3: "Lock-On" (World)'
    )

    expect(cover.url).toBe(
      'https://thumbnails.libretro.com/Sega%20-%20Mega%20Drive%20-%20Genesis/Named_Boxarts/Sonic%20_%20Knuckles%20%2B%20Sonic%203_%20_Lock-On_%20(World).png'
    )
  })

  it('keeps apostrophes, which libretro keeps', () => {
    const [cover] = thumbnailUrls('Nintendo - Game Boy', "Legend of Zelda, The - Link's Awakening")

    expect(cover.url).toContain("Legend%20of%20Zelda%2C%20The%20-%20Link's%20Awakening.png")
  })
})

describe('libretroThumbnails', () => {
  const identity: GameIdentity = {
    providerId: 'libretro-database',
    database: 'Nintendo - Game Boy',
    name: 'Tetris (World) (Rev 1)',
    identifiedBy: 'crc'
  }

  it('names the images of a game the libretro databases identified', async () => {
    expect(await libretroThumbnails.artwork?.(identity)).toEqual(
      thumbnailUrls('Nintendo - Game Boy', 'Tetris (World) (Rev 1)')
    )
  })
})
